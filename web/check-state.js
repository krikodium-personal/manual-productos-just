
const { createDirectus, rest, staticToken, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function checkState() {
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

        console.log('--- Checking products.custom_usage_modes ---');
        const productFields = await client.request(readFields('products'));
        const customField = productFields.find(f => f.field === 'custom_usage_modes');
        console.log('custom_usage_modes:', JSON.stringify(customField, null, 2));

        console.log('--- Checking products_usage_modes fields ---');
        const junctionFields = await client.request(readFields('products_usage_modes'));
        const usageModeId = junctionFields.find(f => f.field === 'usage_mode_id');
        console.log('usage_mode_id:', JSON.stringify(usageModeId, null, 2));

    } catch (e) {
        console.error(e);
    }
}
checkState();
