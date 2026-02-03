const { createDirectus, rest, staticToken, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function inspectSchema() {
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

        const fields = await client.request(readFields('products_usage_modes'));
        const relevantFields = fields.filter(f => ['description', 'usage_mode_id'].includes(f.field));
        console.log('Junction Fields:', JSON.stringify(relevantFields, null, 2));

    } catch (e) {
        console.error(e);
    }
}
inspectSchema();
