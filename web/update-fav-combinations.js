const { createDirectus, rest, staticToken, createField, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function update() {
    try {
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Adding recipe field...');
        try {
            await client.request(createField('favorite_combinations', {
                field: 'recipe',
                type: 'text',
                meta: {
                    interface: 'textarea',
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Preparación Sugerida' }
                    ]
                }
            }));
            console.log('Field recipe created.');
        } catch (e) {
            console.log('Field recipe already exists or failed:', e.message);
        }

        console.log('Updating field labels to Spanish...');
        const mappings = {
            'name': 'Nombre',
            'description': 'Descripción',
            'image': 'Imagen',
            'products': 'Productos Relacionados'
        };

        for (const [field, label] of Object.entries(mappings)) {
            try {
                await client.request(updateField('favorite_combinations', field, {
                    meta: {
                        translations: [
                            { language: 'es-ES', translation: label }
                        ]
                    }
                }));
                console.log(`Updated label for ${field}.`);
            } catch (e) {
                console.log(`Failed to update label for ${field}:`, e.message);
            }
        }

        console.log('Done!');
    } catch (e) {
        console.error('Update failed:', e);
    }
}

update();
