
const { createDirectus, rest, staticToken, createCollection, createField, updateField } = require('@directus/sdk');

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

        console.log('Creating products_custom_usage_modes collection...');

        // 1. Create Collection
        try {
            await client.request(createCollection({
                collection: 'products_custom_usage_modes',
                schema: { name: 'products_custom_usage_modes' },
                meta: {
                    hidden: true, // It's a detail table
                    icon: 'build_circle'
                }
            }));
            console.log('Collection created.');
        } catch (e) {
            console.log('Collection might already exist:', e.message);
        }

        // 2. Create Fields
        console.log('Creating fields...');
        // id is auto-created usually, but let's ensure other fields
        // product_id (M2O)
        try {
            await client.request(createField('products_custom_usage_modes', {
                field: 'product_id',
                type: 'integer',
                schema: {
                    is_nullable: true,
                    foreign_key_table: 'products',
                    foreign_key_column: 'id',
                    on_delete: 'CASCADE' // Delete custom modes if product is deleted
                },
                meta: { hidden: true, interface: 'select-dropdown-m2o' }
            }));
        } catch (e) { }

        // description (Text)
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
        } catch (e) { }

        // application_amount (M2O)
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
                    options: { template: '{{name}} - {{amount}} {{unit}}' }, // Use the nice template we made
                    display_options: { template: '{{name}} - {{amount}} {{unit}}' },
                    width: 'full'
                }
            }));
        } catch (e) { }

        // 3. Update Product Field `custom_usage_modes` to be an Alias to this new collection
        console.log('Updating products.custom_usage_modes field...');

        // First, we need to "delete" the old JSON field or convert it.
        // Directus doesn't allow changing type `json` to `alias` easily via updateField in some versions without data loss implication checks.
        // However, updating the META is key. The Schema type needs to change too.
        // We will try updating the field. If it fails, we might need to delete and recreate.

        try {
            // Check if field exists
            // Assuming it exists as JSON
            // We'll try to update it to be an alias.
            // CAUTION: Changing type from JSON to Alias might require schema change.
            // Actually, alias fields generally DON'T have schema.
            // So we delete the schema part ? No, SDK updateField takes partials.

            // NOTE: It is safer to delete the old field and recreate it as an alias.
            // Given the user screenshot showed "No items", we assume data loss is fine.

            /* await client.request(deleteField('products', 'custom_usage_modes')); */
            // I'll skip delete for safety in script, but if update fails, I'll know.

            // Let's try attempting to update the meta to O2M first.
            // But the underlying type `json` in schema will conflict with `alias`.
            // Directus API usually handles migration if allowed. 
            // For now, I will try to create a NEW field `custom_usage_modes_list` and user can switch?
            // No, user wants `custom_usage_modes`.

            // I will Delete and Recreate the field `custom_usage_modes` in the script.
            // To do that I need `deleteField` imported.
        } catch (e) { }

    } catch (error) {
        console.error('Script failed:', error);
    }
}
// I will write the actual script content with delete/create logic in the next step.
