
const { createDirectus, rest, staticToken, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function fixDisplayTemplate() {
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

        console.log('Force updating display template for custom_usage_modes...');

        await client.request(updateField('products', 'custom_usage_modes', {
            meta: {
                display: 'related-values',
                display_options: {
                    template: '{{description}}'
                }
            }
        }));

        console.log('Display template updated.');

    } catch (e) {
        console.error(e);
    }
}
fixDisplayTemplate();
