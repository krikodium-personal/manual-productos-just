
const { createDirectus, rest, staticToken, deleteCollection, createField, deleteField, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function revertCustomModesToJson() {
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

        console.log('1. Deleting products_custom_usage_modes collection...');
        try {
            await client.request(deleteCollection('products_custom_usage_modes'));
            console.log('Collection deleted.');
        } catch (e) {
            console.log('Delete collection error (maybe strictly alias?):', e.message);
        }

        console.log('2. Recreating products.custom_usage_modes as JSON...');

        // Delete alias field
        try {
            await client.request(deleteField('products', 'custom_usage_modes'));
            console.log('Alias field deleted.');
        } catch (e) { console.log('Delete field error:', e.message); }

        // Create JSON field
        try {
            await client.request(createField('products', {
                field: 'custom_usage_modes',
                type: 'json',
                meta: {
                    interface: 'list', // Repeater
                    special: null, // No special cast needed for JSON usually, or cast-json?
                    options: {
                        template: '{{description}} - {{application_amount}}',
                        fields: [
                            {
                                field: 'description',
                                name: 'Descripción',
                                type: 'text',
                                interface: 'input-multiline',
                                width: 'half'
                            },
                            {
                                field: 'application_amount', // Storing ID
                                name: 'Cantidad de Aplicación',
                                type: 'integer',
                                interface: 'select-dropdown-m2o', // Try this!
                                // For this to work in repeater, we often need 'collection' specified here?
                                // Or maybe 'foreign_key_table' in schema? But schema is virtual here.
                                // In recent Directus, we can pass 'collection' in options?
                                options: {
                                    template: '{{name}} - {{amount}} {{unit}}'
                                },
                                collection: 'application_amounts', // HACK/Feature: explicit collection for interface
                                width: 'half'
                            }
                        ]
                    },
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Modos de empleo personalizados' }
                    ]
                }
            }));
            console.log('JSON field created with repeater interface.');
        } catch (e) { console.log('Create JSON field error:', e.message); }

    } catch (error) {
        console.error('Script failed:', error);
    }
}
revertCustomModesToJson();
