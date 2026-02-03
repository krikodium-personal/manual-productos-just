const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function addDoubleCleanse() {
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

        console.log(`Adding Double Cleanse fields to ${collection}...`);

        // 1. Title
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'double_cleanse_title',
                type: 'string',
                meta: {
                    interface: 'input',
                    width: 'full',
                    translations: [{ language: 'es-ES', translation: 'Título Doble Limpieza' }],
                    note: 'Ej: ¿Qué es la doble limpieza?'
                }
            })
        });

        // 2. Image
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'double_cleanse_image',
                type: 'uuid',
                schema: {
                    foreign_key_table: 'directus_files',
                    foreign_key_column: 'id'
                },
                meta: {
                    interface: 'file-image',
                    special: ['file'],
                    width: 'full',
                    translations: [{ language: 'es-ES', translation: 'Imagen Doble Limpieza' }]
                }
            })
        });

        // 3. Items (Repeater)
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'double_cleanse_items',
                type: 'json',
                meta: {
                    interface: 'list', // Repeater
                    special: ['cast-json'],
                    width: 'full',
                    translations: [{ language: 'es-ES', translation: 'Items Doble Limpieza' }],
                    options: {
                        template: '{{text}}',
                        fields: [
                            {
                                field: 'text',
                                name: 'Texto',
                                type: 'text',
                                interface: 'input-multiline',
                                width: 'full'
                            }
                        ],
                        addLabel: 'Agregar Item'
                    }
                }
            })
        });

        console.log('✅ Double Cleanse fields added.');

    } catch (error) {
        console.error('Error:', error);
    }
}

addDoubleCleanse();
