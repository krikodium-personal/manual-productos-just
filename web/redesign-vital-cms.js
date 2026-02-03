const { createDirectus, rest, updateCollection, createField, deleteField } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function redesignSchema() {
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

        const collection = 'vital_just_content';

        console.log('1. Converting to Singleton...');
        await fetch(`${url}/collections/${collection}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                singleton: true,
                note: 'Contenido fijo para la página Vital Just'
            })
        });

        console.log('2. Deleting old "lines" field...');
        // We catch error in case it's already deleted
        await fetch(`${url}/fields/${collection}/lines`, {
            method: 'DELETE',
            headers
        }).catch(err => console.log('Field lines might vary', err));


        console.log('3. Creating Fixed Line Fields...');

        const lines = [1, 2, 3];

        for (const num of lines) {
            console.log(`Creating Line ${num}...`);

            // Separator/Alias for UI niceness (optional but good)
            // We'll just add the fields. directus usually allows "group" fields but let's stick to simple fields first.

            // Title
            await fetch(`${url}/fields/${collection}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    field: `line_${num}_title`,
                    type: 'string',
                    meta: {
                        interface: 'input',
                        width: 'full',
                        translations: [{ language: 'es-ES', translation: `Título Línea ${num}` }]
                    }
                })
            });

            // Products Repeater
            await fetch(`${url}/fields/${collection}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    field: `line_${num}_products`,
                    type: 'json',
                    meta: {
                        interface: 'list',
                        special: ['cast-json'],
                        width: 'full',
                        translations: [{ language: 'es-ES', translation: `Productos Línea ${num}` }],
                        options: {
                            template: '{{text}}',
                            fields: [
                                {
                                    field: 'text',
                                    name: 'Producto',
                                    type: 'string',
                                    interface: 'input',
                                    width: 'full'
                                }
                            ],
                            addLabel: 'Agregar Producto'
                        }
                    }
                })
            });
        }

        console.log('✅ CMS Redesign Complete: Singleton + 3 Lines.');

    } catch (error) {
        console.error('Error:', error);
    }
}

redesignSchema();
