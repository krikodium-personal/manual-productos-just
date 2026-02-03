
const { createDirectus, rest, staticToken, createField, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function addCustomModeTitle() {
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

        console.log('Adding title (Modo de uso) field...');

        try {
            await client.request(createField('products_custom_usage_modes', {
                field: 'title',
                type: 'string',
                meta: {
                    interface: 'input',
                    options: { iconRight: 'title' },
                    display: 'raw',
                    readonly: false,
                    hidden: false,
                    sort: 2, // Position 2
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Modo de uso' }
                    ]
                }
            }));
            console.log('Field title created.');
        } catch (e) {
            console.log('Field title likely exists, updating meta...');
            await client.request(updateField('products_custom_usage_modes', 'title', {
                meta: {
                    interface: 'input',
                    sort: 2,
                    translations: [{ language: 'es-ES', translation: 'Modo de uso' }]
                }
            }));
        }

        console.log('Reordering other fields...');

        // Ensure Description is 1
        await client.request(updateField('products_custom_usage_modes', 'description', {
            meta: { sort: 1 }
        }));

        // Ensure Application Amount is 3
        await client.request(updateField('products_custom_usage_modes', 'application_amount', {
            meta: { sort: 3 }
        }));

        console.log('Fields reordered: Description(1) -> Title(2) -> Amount(3).');

    } catch (e) {
        console.error(e);
    }
}
addCustomModeTitle();
