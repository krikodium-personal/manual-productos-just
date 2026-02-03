
const { createDirectus, rest, staticToken, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function switchInterfaceO2M() {
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

        console.log('Updating products.usage_modes interface to list-o2m...');

        await client.request(updateField('products', 'usage_modes', {
            meta: {
                interface: 'list-o2m',
                special: ['o2m'], // Update special to O2M to reflect ownership
                options: {
                    enableCreate: true,
                    fields: ['description', 'usage_mode_id'], // Explicitly show these in the list?
                    template: '{{usage_mode_id.title}}'
                }
            }
        }));

        console.log('Interface switched to list-o2m successfully!');

    } catch (e) {
        console.error(e);
    }
}
switchInterfaceO2M();
