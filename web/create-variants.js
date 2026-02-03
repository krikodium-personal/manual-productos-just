const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function createVariantsCollection() {
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

        const collection = 'variants';
        console.log(`Creating collection ${collection}...`);

        const createRes = await fetch(`${url}/collections`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: collection,
                schema: {},
                meta: {
                    translations: [
                        { language: 'es-ES', translation: 'Variantes', singular: 'Variante', plural: 'Variantes' }
                    ],
                    icon: 'package'
                }
            })
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            if (err.errors?.[0]?.code === 'RECORD_NOT_UNIQUE') {
                console.log(`Collection ${collection} already exists.`);
            } else {
                console.error('Error creating collection:', err);
                return;
            }
        } else {
            console.log(`Collection ${collection} created.`);
        }

        // Add Fields
        const fields = [
            {
                field: 'capacity_value',
                type: 'integer', // or decimal/float? User said "10 ml". Value is separate.
                meta: {
                    interface: 'input',
                    translations: [{ language: 'es-ES', translation: 'Valor Capacidad' }]
                }
            },
            {
                field: 'capacity_unit',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'ml', value: 'ml' },
                            { text: 'g', value: 'g' },
                            { text: 'l', value: 'l' },
                            { text: 'kg', value: 'kg' },
                            { text: 'oz', value: 'oz' }
                        ]
                    },
                    translations: [{ language: 'es-ES', translation: 'Unidad Capacidad' }]
                }
            }
        ];

        for (const field of fields) {
            console.log(`Adding field ${field.field}...`);
            const res = await fetch(`${url}/fields/${collection}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(field)
            });
            if (!res.ok) {
                // Ignore if exists
            } else {
                console.log(`Field ${field.field} added.`);
            }
        }

        // Permissions? Public READ? Admin WRITE.
        // Usually handled separately, but let's assume Admin default is full access.
        // We might want Public Read for frontend.

    } catch (error) {
        console.error('Error:', error);
    }
}

createVariantsCollection();
