
const { createDirectus, rest, staticToken, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function hideUsageModeId() {
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

        console.log('Hiding products_usage_modes.usage_mode_id in the form...');

        await client.request(updateField('products_usage_modes', 'usage_mode_id', {
            meta: {
                hidden: true, // Hide from form
                readonly: true // Ensure it can't be edited once created (it's the PK part basically)
            }
        }));

        console.log('usage_mode_id hidden successfully.');

    } catch (e) {
        console.error(e);
    }
}
hideUsageModeId();
