const { createDirectus, rest, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function updateSchema() {
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
        const field = 'lines';

        console.log(`Updating field ${field} in ${collection}...`);

        // Update the field to change 'descriptions' (tags) to 'sub_lines' (repeater)
        // We keep 'lines' as JSON List, but modify its nested fields option.
        await fetch(`${url}/fields/${collection}/${field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    options: {
                        template: '{{title}}',
                        fields: [
                            {
                                field: 'title',
                                name: 'Título',
                                type: 'string',
                                interface: 'input',
                                width: 'full'
                            },
                            {
                                field: 'sub_lines',
                                name: 'Sub Líneas (Productos)',
                                type: 'json',
                                interface: 'list', // Nested list/repeater
                                width: 'full',
                                options: {
                                    template: '{{text}}',
                                    fields: [
                                        {
                                            field: 'text',
                                            name: 'Nombre del Producto',
                                            type: 'string',
                                            interface: 'input',
                                            width: 'full'
                                        }
                                    ],
                                    addLabel: 'Agregar Producto'
                                }
                            }
                        ]
                    }
                }
            })
        });

        console.log('✅ CMS Schema Updated: "descriptions" replaced with "sub_lines".');

    } catch (error) {
        console.error('Error:', error);
    }
}

updateSchema();
