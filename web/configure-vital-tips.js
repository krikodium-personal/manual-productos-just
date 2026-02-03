const { createDirectus, rest, createField } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function configureTips() {
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

        console.log(`Configuring fields for ${collection}...`);

        // 1. Description
        // Check if exists/create
        console.log('Creating description field...');
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'description',
                type: 'text',
                meta: {
                    interface: 'input-multiline',
                    width: 'full',
                    translations: [{ language: 'es-ES', translation: 'Descripción' }],
                    note: 'Texto del tip'
                }
            })
        }).then(res => res.json()).then(d => {
            if (d.errors) console.log('Description field might exist:', d.errors[0].message);
            else console.log('Description field created.');
        });

        // 2. Photo
        console.log('Creating photo field...');
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'photo',
                type: 'uuid',
                schema: {
                    foreign_key_table: 'directus_files',
                    foreign_key_column: 'id' // Standard for linking files
                },
                meta: {
                    interface: 'file-image',
                    special: ['file'], // Important for file handling
                    width: 'full',
                    translations: [{ language: 'es-ES', translation: 'Foto' }],
                    note: 'Foto ilustrativa'
                }
            })
        }).then(res => res.json()).then(d => {
            if (d.errors) console.log('Photo field might exist:', d.errors[0].message);
            else console.log('Photo field created.');
        });

        console.log('✅ Vital Just Tips configured.');

    } catch (error) {
        console.error('Error:', error);
    }
}

configureTips();
