
const { createDirectus, rest, staticToken, updateCollection } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function fixCollectionDisplay() {
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

        console.log('Updating products_custom_usage_modes collection display_template...');

        await client.request(updateCollection('products_custom_usage_modes', {
            meta: {
                display_template: '{{description}}'
            }
        }));

        console.log('Collection display_template set to {{description}}.');

    } catch (e) {
        console.error(e);
    }
}
fixCollectionDisplay();
