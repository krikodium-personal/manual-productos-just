
const { createDirectus, rest, staticToken, readRelations, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function checkRelations() {
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

        console.log('--- Checking Relations for products_custom_usage_modes ---');
        const relations = await client.request(readRelations());
        const myRel = relations.filter(r => r.collection === 'products_custom_usage_modes' || r.related_collection === 'products_custom_usage_modes');
        console.log('Relations:', JSON.stringify(myRel, null, 2));

        console.log('--- Checking show_custom_usage_modes field ---');
        const fields = await client.request(readFields('products'));
        const showField = fields.find(f => f.field.includes('show_') || f.field.includes('custom'));
        // Filter for specific boolean likely
        const booleans = fields.filter(f => f.field === 'show_custom_usage_modes');
        console.log('Boolean field:', JSON.stringify(booleans, null, 2));

    } catch (e) {
        console.error(e);
    }
}
checkRelations();
