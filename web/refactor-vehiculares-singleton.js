const { createDirectus, rest, staticToken, deleteCollection, createCollection, createField, createItem, readItems, readCollections, updateField, updateCollection } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';
const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

async function refactor() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const client = createDirectus(url).with(rest()).with(staticToken(token));

        // 1. Delete if exists (from previous failed attempt)
        console.log('Cleaning up previous attempt...');
        try {
            await client.request(deleteCollection('vehiculares'));
        } catch (e) { }

        // 2. Fetch current data
        console.log('Fetching legacy data...');
        const legacyContent = await client.request(readItems('vehicular_content', { limit: 1 }));
        const legacyAdvantages = await client.request(readItems('vehicular_advantages', { limit: -1 }));

        const content = legacyContent[0];

        // 3. Create the new collection (Normal first)
        console.log('Creating "vehiculares" collection...');
        await client.request(createCollection({
            collection: 'vehiculares',
            meta: {
                icon: 'auto_awesome',
                note: 'Landing page for Vehiculares Aromablends'
            },
            schema: {}
        }));

        // Add fields manually
        const fields = [
            {
                field: 'title',
                type: 'string',
                meta: { interface: 'input', width: 'full' }
            },
            {
                field: 'description',
                type: 'text',
                meta: { interface: 'textarea', width: 'full' }
            },
            {
                field: 'advantages_title',
                type: 'string',
                meta: { interface: 'input', width: 'full' }
            }
        ];

        for (const f of fields) {
            console.log(`Adding field ${f.field}...`);
            await client.request(createField('vehiculares', f));
        }

        // 4. Update vehicular_advantages to point to the new collection
        console.log('Updating vehicular_advantages relation...');
        const advFields = await client.request(readItems('vehicular_advantages')); // dummy to check access

        // Add vehiculares_id to vehicular_advantages if not exists
        try {
            await client.request(createField('vehicular_advantages', {
                field: 'vehiculares_id',
                type: 'integer',
                meta: { interface: 'select-dropdown-m2o', hidden: true },
                schema: {
                    foreign_key_column: 'id',
                    foreign_key_table: 'vehiculares'
                }
            }));
        } catch (e) {
            console.log('vehiculares_id field already exists or failed:', e.message);
        }

        // 5. Populate the singleton
        console.log('Populating singleton...');
        await client.request(createItem('vehiculares', {
            id: 1,
            title: content.title,
            description: content.description,
            advantages_title: content.advantages_title || 'Ventajas de los vehiculares aromablends'
        }));

        // 6. Create the O2M field in vehiculares to show the advantages list
        console.log('Adding O2M field to vehiculares...');
        await client.request(createField('vehiculares', {
            field: 'advantages',
            type: 'alias',
            meta: {
                interface: 'list-o2m',
                special: ['o2m'],
                options: {
                    fields: ['text'],
                    enableCreate: true,
                    enableSelect: false
                }
            },
            schema: null
        }));

        // 7. Migrate advantages
        console.log('Migrating advantages...');
        for (const adv of legacyAdvantages) {
            await fetch(`${url}/items/vehicular_advantages/${adv.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ vehiculares_id: 1 })
            });
        }

        // 8. Grant permissions
        console.log('Granting permissions...');
        await fetch(`${url}/permissions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ policy: publicPolicyId, collection: 'vehiculares', action: 'read', fields: ['*'] })
        });

        // 9. Set as singleton
        console.log('Setting collection as singleton...');
        await client.request(updateCollection('vehiculares', {
            meta: { singleton: true }
        }));

        // 10. Cleanup legacy collection
        console.log('Deleting legacy collection...');
        await client.request(deleteCollection('vehicular_content'));

        console.log('Refactor complete!');
    } catch (e) {
        console.error('Refactor failed:', e);
    }
}

refactor();
