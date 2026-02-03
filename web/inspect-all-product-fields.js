
const { createDirectus, rest, staticToken, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function inspectProductFields() {
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
        const relevant = fields
            .filter(f => f.field.includes('custom') || f.field.includes('usage'))
            .map(f => ({
                field: f.field,
                type: f.type,
                interface: f.meta?.interface,
                special: f.meta?.special
            }));
        console.log('Product Fields (Filtered):', JSON.stringify(relevant, null, 2));

    } catch (e) {
        console.error(e);
    }
}
inspectProductFields();
