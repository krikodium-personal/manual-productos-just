const { createDirectus, rest, createField } = require('@directus/sdk');

const url = 'http://localhost:8055';
// Note: We need admin access to create fields.
const directus = createDirectus(url).with(rest());

async function configureCMS() {
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

        console.log(`Configuring fields for ${collection}...`);

        // 1. Hero Title
        console.log('Creating hero_title...');
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'hero_title',
                type: 'string',
                meta: {
                    interface: 'input',
                    display: 'raw',
                    readonly: false,
                    hidden: false,
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Título Hero' }
                    ]
                }
            })
        });

        // 2. Hero Description
        console.log('Creating hero_description...');
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'hero_description',
                type: 'text',
                meta: {
                    interface: 'input-multiline',
                    display: 'raw',
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Descripción Hero' }
                    ]
                }
            })
        });

        // 3. Hero Image
        console.log('Creating hero_image...');
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'hero_image',
                type: 'uuid',
                schema: {
                    foreign_key_table: 'directus_files',
                    foreign_key_column: 'id'
                },
                meta: {
                    interface: 'file-image',
                    display: 'image',
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Imagen Hero' }
                    ]
                }
            })
        });

        // 4. Lines (JSON Repeater)
        // We want a repeater that has: title (string) and descriptions (tags? or list)
        console.log('Creating lines...');
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'lines',
                type: 'json',
                meta: {
                    interface: 'list', // or 'repeater' if available, 'list' is often Key-Value-ish or simple
                    // Better: 'repeater' allows nested fields configuration in options
                    special: ['cast-json'],
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Líneas' }
                    ],
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
                                field: 'descriptions',
                                name: 'Descripciones',
                                type: 'json',
                                interface: 'tags', // user can type and hit enter
                                width: 'full',
                                options: {
                                    placeholder: 'Escriba una descripción y presione Enter'
                                }
                            }
                        ]
                    }
                }
            })
        });

        console.log('✅ CMS Configuration Complete.');

    } catch (error) {
        console.error('Error:', error);
    }
}

configureCMS();
