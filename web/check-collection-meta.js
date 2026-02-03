
const { createDirectus, rest, staticToken, readCollection } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function checkCollectionMeta() {
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

        console.log('--- Checking products_custom_usage_modes Collection Meta ---');
        const collection = await client.request(readCollection('products_custom_usage_modes'));
        console.log('Collection:', JSON.stringify(collection, null, 2));

    } catch (e) {
        console.error(e);
    }
}
checkCollectionMeta();
