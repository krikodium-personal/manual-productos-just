
const { createDirectus, rest, staticToken, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function inspectProductField() {
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

        const fields = await client.request(readFields('products'));
        const m2mField = fields.find(f => f.field === 'usage_modes');
        console.log('Product M2M Field:', JSON.stringify(m2mField, null, 2));

    } catch (e) {
        console.error(e);
    }
}
inspectProductField();
