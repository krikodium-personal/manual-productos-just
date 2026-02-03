
const { createDirectus, rest, staticToken, createCollection, createField, deleteField, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function setupCustomModes() {
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

        console.log('1. Creating products_custom_usage_modes collection...');
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
            console.log('Collection creation skipped (exists?):', e.message);
        }

        console.log('2. Creating fields in products_custom_usage_modes...');

        try {
            await client.request(createField('products_custom_usage_modes', {
                field: 'product_id',
                type: 'integer',
                schema: {
                    is_nullable: true,
                    foreign_key_table: 'products',
                    foreign_key_column: 'id',
                    on_delete: 'CASCADE'
                },
                meta: { hidden: true, interface: 'select-dropdown-m2o' }
            }));
            console.log('product_id field created.');
        } catch (e) { console.log('product_id error:', e.message); }

        try {
            await client.request(createField('products_custom_usage_modes', {
                field: 'description',
                type: 'text',
                meta: {
                    interface: 'input-multiline',
                    display: 'raw',
                    width: 'full',
                    note: 'Instrucciones personalizadas'
                }
            }));
            console.log('description field created.');
        } catch (e) { console.log('description error:', e.message); }

        try {
            await client.request(createField('products_custom_usage_modes', {
                field: 'application_amount',
                type: 'integer',
                schema: {
                    is_nullable: true,
                    foreign_key_table: 'application_amounts',
                    foreign_key_column: 'id'
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    options: { template: '{{name}} - {{amount}} {{unit}}' },
                    display_options: { template: '{{name}} - {{amount}} {{unit}}' },
                    width: 'full',
                    note: 'Cantidad a utilizar'
                }
            }));
            console.log('application_amount field created.');
        } catch (e) { console.log('application_amount error:', e.message); }

        console.log('3. Replacing products.custom_usage_modes field...');

        // Delete old JSON field
        try {
            console.log('Deleting old JSON field...');
            await client.request(deleteField('products', 'custom_usage_modes'));
            console.log('Old field deleted.');
        } catch (e) {
            console.log('Delete field error (maybe alias already?):', e.message);
        }

        // Create new Alias field
        try {
            console.log('Creating new Alias field...');
            await client.request(createField('products', {
                field: 'custom_usage_modes',
                type: 'alias',
                meta: {
                    interface: 'list-o2m',
                    special: ['o2m'],
                    options: {
                        enableCreate: true,
                        enableSelect: false // Can't select existing for custom items usually
                    },
                    display: 'related-values',
                    display_options: { template: '{{description}}' },
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Modos de empleo personalizados' }
                    ]
                }
            }));
            console.log('New Alias field created.');

            // We need to verify relation is set? 
            // Creating an Alias O2M field relies on the Child (products_custom_usage_modes) pointing to Parent.
            // Directus auto-discovery usually finds it if naming is standard, but explicit is better.

            // Wait, for O2M Alias, we just need the Child to exist and point to Parent.
            // But we need to tell the Alias WHICH collection it points to? 
            // Actually, `createField` for alias doesn't define the relationship. The RELATION endpoint does.
            // But for O2M, the relation is on the OTHER side (`products_custom_usage_modes.product_id`).
            // We need to update the Relation Metadata of the CHILD to point to this Alias.

        } catch (e) { console.log('Create alias error:', e.message); }

        console.log('4. Configuring Relationship Metadata...');
        // We need to update ONLY the metadata of products_custom_usage_modes.product_id 
        // to tell it "Hey, I belong to the field 'custom_usage_modes' on collection 'products'".

        const { updateRelation } = require('@directus/sdk');
        try {
            await client.request(updateRelation('products_custom_usage_modes', 'product_id', {
                meta: {
                    one_field: 'custom_usage_modes', // This links the O2M alias
                    one_collection: 'products',
                    one_collection_field: null,
                    junction_field: null,
                    sort_field: null
                }
            }));
            console.log('Relationship metadata updated.');
        } catch (e) { console.log('Relation update error:', e.message); }

    } catch (error) {
        console.error('Script failed:', error);
    }
}

setupCustomModes();
