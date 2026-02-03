
const { createDirectus, rest, staticToken, createRelation, updatePermission, readPermissions, createPermission } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function fixRelationAndPerms() {
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

        console.log('1. Creating Relationship for products_custom_usage_modes.product_id...');
        try {
            await client.request(createRelation({
                collection: 'products_custom_usage_modes',
                field: 'product_id',
                related_collection: 'products',
                schema: {
                    on_delete: 'CASCADE',
                    foreign_key_column: 'id',
                    foreign_key_table: 'products',
                    constraint_name: 'products_custom_usage_modes_product_id_foreign' // Explicit name usually safer
                },
                meta: {
                    one_field: 'custom_usage_modes', // THIS connects it to the alias
                    one_collection: 'products',
                    one_collection_field: null,
                    junction_field: null,
                    sort_field: null
                }
            }));
            console.log('Relationship created successfully.');
        } catch (e) {
            console.log('Relation creation error (might exist?):', e.message);
            // If it exists, we might need to update it again?
        }

        console.log('2. Granting Public Permissions...');
        // Find public role
        const roles = await fetch(`${url}/roles`).then(r => r.json());
        // Actually directus public role is null/empty usually? No, it has an ID or we use permissions endpoint without role properly.
        // Public permissions have role = null.

        // Let's use the SDK to find public permissions
        const perms = await client.request(readPermissions({
            filter: { role: { _null: true } }
        }));

        const collections = ['products_custom_usage_modes'];

        for (const col of collections) {
            const existing = perms.find(p => p.collection === col && p.action === 'read');
            if (!existing) {
                console.log(`Creating public read permission for ${col}...`);
                await client.request(createPermission({
                    role: null,
                    collection: col,
                    action: 'read',
                    permissions: {},
                    fields: ['*']
                }));
            } else {
                console.log(`Public read permission for ${col} already exists.`);
            }
        }

    } catch (error) {
        console.error('Script failed:', error);
    }
}
fixRelationAndPerms();
