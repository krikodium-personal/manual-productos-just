
const { createDirectus, rest, staticToken, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function updateM2MOptions() {
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

        console.log('Updating products.usage_modes M2M options...');

        await client.request(updateField('products', 'usage_modes', {
            meta: {
                options: {
                    enableCreate: true, // Allow creating new (might expose full form)
                    enableSelect: true
                }
            }
        }));

        console.log('Updated products.usage_modes options: enableCreate=true');

    } catch (e) {
        console.error(e);
    }
}
updateM2MOptions();
