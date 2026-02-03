const { createDirectus, rest, staticToken, createCollection, createField, createItem, readCollections, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';
const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

async function setup() {
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

        // 1. Create fields for favorite_combinations
        console.log('Adding fields to favorite_combinations...');
        const fields = [
            {
                field: 'name',
                type: 'string',
                meta: { interface: 'input', width: 'full' }
            },
            {
                field: 'description',
                type: 'text',
                meta: { interface: 'textarea', width: 'full' }
            },
            {
                field: 'image',
                type: 'uuid',
                meta: { interface: 'file', width: 'full' }
            }
        ];

        for (const f of fields) {
            try {
                await client.request(createField('favorite_combinations', f));
                console.log(`Field ${f.field} created.`);
            } catch (e) {
                console.log(`Field ${f.field} already exists or failed:`, e.message);
            }
        }

        // 2. Setup M2M Relationship with products
        console.log('Setting up M2M relationship with products...');

        // 2a. Create Junction Collection
        try {
            await client.request(createCollection({
                collection: 'favorite_combinations_products',
                meta: { hidden: true },
                schema: {},
                fields: [
                    {
                        field: 'id',
                        type: 'integer',
                        meta: { hidden: true },
                        schema: { is_primary_key: true, has_auto_increment: true }
                    },
                    {
                        field: 'favorite_combinations_id',
                        type: 'integer',
                        schema: { foreign_key_table: 'favorite_combinations', foreign_key_column: 'id' }
                    },
                    {
                        field: 'products_id',
                        type: 'integer',
                        schema: { foreign_key_table: 'products', foreign_key_column: 'id' }
                    }
                ]
            }));
            console.log('Junction collection created.');
        } catch (e) {
            console.log('Junction collection already exists or failed:', e.message);
        }

        // 2b. Add M2M field to favorite_combinations
        try {
            await client.request(createField('favorite_combinations', {
                field: 'products',
                type: 'alias',
                meta: {
                    interface: 'list-m2m',
                    special: ['m2m'],
                    options: {
                        template: '{{products_id.name}}'
                    }
                }
            }));
            console.log('M2M field added to favorite_combinations.');
        } catch (e) {
            console.log('M2M field already exists or failed:', e.message);
        }

        // 3. Grant public read permissions
        console.log('Granting permissions...');
        const collectionsToGrant = ['favorite_combinations', 'favorite_combinations_products'];
        for (const col of collectionsToGrant) {
            await fetch(`${url}/permissions`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ policy: publicPolicyId, collection: col, action: 'read', fields: ['*'] })
            });
        }

        console.log('Done!');
    } catch (e) {
        console.error('Setup failed:', e);
    }
}

setup();
