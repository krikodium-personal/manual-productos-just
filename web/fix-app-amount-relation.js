
const { createDirectus, rest, staticToken, createRelation } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function fixAppAmountRelation() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Creating relationship for application_amount...');

        await client.request(createRelation({
            collection: 'products_custom_usage_modes',
            field: 'application_amount',
            related_collection: 'application_amounts',
            schema: {
                constraint_name: 'products_custom_usage_modes_application_amount_foreign',
                on_delete: 'SET NULL', // or CASCADE depending on preference, usually SET NULL for catalogs
                foreign_key_column: 'id',
                foreign_key_table: 'application_amounts'
            },
            meta: {
                one_collection: 'application_amounts',
                one_allowed_collections: null,
                one_collection_field: null,
                one_deselect_action: 'nullify',
                junction_field: null,
                sort_field: null
            }
        }));

        console.log('Relationship created successfully.');

    } catch (e) {
        console.error('Error creating relation:', e.message);
        console.error(JSON.stringify(e));
    }
}
fixAppAmountRelation();
