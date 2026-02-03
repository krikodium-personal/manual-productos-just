
const { createDirectus, rest, staticToken, updateField, deleteField, createCollection, createField, createRelation, updateRelation, readPermissions, createPermission } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function cleanupAndRestore() {
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

        console.log('1. Hiding custom_text in products_usage_modes...');
        try {
            await client.request(updateField('products_usage_modes', 'custom_text', {
                meta: {
                    hidden: true,
                    interface: null // Hide it completely
                }
            }));
            console.log('custom_text hidden.');
        } catch (e) {
            console.log('Error hiding custom_text (maybe not found?):', e.message);
        }

        console.log('2. Deleting custom_usage_modes JSON field...');
        try {
            await client.request(deleteField('products', 'custom_usage_modes'));
            console.log('JSON field deleted.');
        } catch (e) {
            console.log('Error deleting JSON field:', e.message);
        }

        console.log('3. Ensuring products_custom_usage_modes collection exists...');
        try {
            await client.request(createCollection({
                collection: 'products_custom_usage_modes',
                schema: { name: 'products_custom_usage_modes' },
                meta: {
                    hidden: true,
                    icon: 'build_circle',
                    note: 'Custom usage modes for products'
                }
            }));
            console.log('Collection created.');
        } catch (e) {
            console.log('Collection exists or error:', e.message);
        }

        console.log('3b. Creating fields if missing...');
        try {
            await client.request(createField('products_custom_usage_modes', {
                field: 'product_id',
                type: 'integer',
                schema: { is_nullable: true, foreign_key_table: 'products', foreign_key_column: 'id', on_delete: 'CASCADE' },
                meta: { hidden: true, interface: 'select-dropdown-m2o' }
            }));
        } catch (e) { }
        try {
            await client.request(createField('products_custom_usage_modes', {
                field: 'description',
                type: 'text',
                meta: { interface: 'input-multiline', display: 'raw', width: 'full' }
            }));
        } catch (e) { }
        try {
            await client.request(createField('products_custom_usage_modes', {
                field: 'application_amount',
                type: 'integer',
                schema: { is_nullable: true, foreign_key_table: 'application_amounts', foreign_key_column: 'id' },
                meta: {
                    interface: 'select-dropdown-m2o',
                    options: { template: '{{name}} - {{amount}} {{unit}}' },
                    display_options: { template: '{{name}} - {{amount}} {{unit}}' },
                    width: 'full'
                }
            }));
        } catch (e) { }

        console.log('4. Creating O2M Alias custom_usage_modes...');
        try {
            await client.request(createField('products', {
                field: 'custom_usage_modes',
                type: 'alias',
                meta: {
                    interface: 'list-o2m',
                    special: ['o2m'],
                    options: { enableCreate: true, enableSelect: false },
                    display: 'related-values',
                    display_options: { template: '{{description}}' },
                    width: 'full',
                    translations: [{ language: 'es-ES', translation: 'Modos de empleo personalizados' }]
                }
            }));
            console.log('Alias created.');
        } catch (e) {
            console.log('Error creating alias:', e.message);
        }

        console.log('5. Fixing Relationship Metadata...');
        // Create/Update Relation
        try {
            // Try creating first
            await client.request(createRelation({
                collection: 'products_custom_usage_modes',
                field: 'product_id',
                related_collection: 'products',
                schema: { on_delete: 'CASCADE', foreign_key_column: 'id', foreign_key_table: 'products', constraint_name: 'products_custom_usage_modes_product_id_foreign_new' },
                meta: {
                    one_field: 'custom_usage_modes',
                    one_collection: 'products',
                    one_collection_field: null,
                    junction_field: null,
                    sort_field: null
                }
            }));
            console.log('Relation created.');
        } catch (e) {
            console.log('Relation creation failed (exists?), updating meta...');
            try {
                await client.request(updateRelation('products_custom_usage_modes', 'product_id', {
                    meta: {
                        one_field: 'custom_usage_modes',
                        one_collection: 'products',
                        one_collection_field: null,
                        junction_field: null
                    }
                }));
                console.log('Relation updated.');
            } catch (e2) {
                console.log('Relation update failed:', e2.message);
            }
        }

        console.log('6. Ensuring permissions...');
        // Re-run permission grant logic inline or assume grant-public-permissions covers it (it does, but let's be safe)
        const perms = await client.request(readPermissions({ filter: { role: { _null: true }, collection: { _eq: 'products_custom_usage_modes' } } }));
        if (perms.length === 0) {
            await client.request(createPermission({ role: null, collection: 'products_custom_usage_modes', action: 'read', permissions: {}, fields: ['*'] }));
            console.log('Permission granted.');
        }

        console.log('DONE: Custom text hidden, Custom Usage Modes restored.');

    } catch (error) {
        console.error('Script failed:', error);
    }
}
cleanupAndRestore();
