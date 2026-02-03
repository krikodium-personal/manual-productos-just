const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function addSubDescriptions() {
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

        const collection = 'vital_just_tips';
        const field = 'sub_descriptions';

        console.log(`Adding ${field} to ${collection}...`);

        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: field,
                type: 'json',
                meta: {
                    interface: 'list',
                    special: ['cast-json'],
                    width: 'full',
                    translations: [{ language: 'es-ES', translation: 'Sub-descripciones (Bullets)' }],
                    note: 'Lista de puntos que aparecen debajo de la descripción',
                    options: {
                        template: '{{text}}',
                        fields: [
                            {
                                field: 'text',
                                name: 'Texto',
                                type: 'string',
                                interface: 'input',
                                width: 'full'
                            }
                        ],
                        addLabel: 'Agregar Punto'
                    }
                }
            })
        }).then(async res => {
            const json = await res.json();
            if (json.errors) console.log('Result:', json.errors[0].message);
            else console.log(`✅ Field ${field} created successfully.`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

addSubDescriptions();
