const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function refactorTips() {
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

        // 1. Add fields to vital_just_tips
        console.log('Adding fields to vital_just_tips...');

        // Title
        await fetch(`${url}/fields/vital_just_tips`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'title',
                type: 'string',
                meta: {
                    interface: 'input',
                    width: 'half', // Half width for better layout
                    translations: [{ language: 'es-ES', translation: 'Título (Opcional)' }],
                    note: 'Usado para secciones destacadas'
                }
            })
        }).then(res => res.json()).then(d => {
            if (d.errors) console.log('Title error (maybe exists?):', d.errors[0].message);
        });

        // Boolean Flag
        await fetch(`${url}/fields/vital_just_tips`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'is_highlighted_section',
                type: 'boolean',
                meta: {
                    interface: 'boolean',
                    width: 'half',
                    special: ['cast-boolean'],
                    translations: [{ language: 'es-ES', translation: '¿Es Sección Destacada?' }],
                    note: 'Activar para mostrar con formato especial (Ej: Doble Limpieza)'
                },
                schema: {
                    default_value: false
                }
            })
        }).then(res => res.json()).then(d => {
            if (d.errors) console.log('Boolean error:', d.errors[0].message);
        });

        // 2. Remove old fields from vital_just_content
        console.log('Cleaning up vital_just_content...');
        const fieldsToDelete = ['double_cleanse_title', 'double_cleanse_image', 'double_cleanse_items'];

        for (const field of fieldsToDelete) {
            await fetch(`${url}/fields/vital_just_content/${field}`, {
                method: 'DELETE',
                headers
            }).catch(e => console.log(`Error deleting ${field}`, e));
        }

        console.log('✅ CMS Refactor Complete.');

    } catch (error) {
        console.error('Error:', error);
    }
}

refactorTips();
