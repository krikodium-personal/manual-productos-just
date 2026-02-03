const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function createRelations() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const collection = 'vital_just_flyers';
        const fields = ['image', 'file'];

        for (const field of fields) {
            console.log(`Creating relation for ${field}...`);
            const response = await fetch(`${url}/relations`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    collection: collection,
                    field: field,
                    related_collection: 'directus_files',
                    schema: {
                        on_delete: 'SET NULL' // Standard behavior
                    },
                    meta: {
                        // Meta is optional but good for UI settings? 
                        // Actually the field meta handles interface. Relation meta handles sorting/display of related items?
                        // For Many-to-One (file), we usually don't need much meta on the relation itself.
                    }
                })
            });

            if (response.ok) {
                console.log(`✅ Relation created for ${field}.`);
            } else {
                const err = await response.json();
                if (err.errors?.[0]?.code === 'RECORD_NOT_UNIQUE') {
                    console.log(`Relation for ${field} already exists (unexpected based on previous check).`);
                } else {
                    console.error(`❌ Failed to create relation for ${field}:`, JSON.stringify(err, null, 2));
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

createRelations();
