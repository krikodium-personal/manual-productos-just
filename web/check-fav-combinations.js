const { createDirectus, rest, staticToken, readCollections, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function check() {
    try {
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const client = createDirectus(url).with(rest()).with(staticToken(token));

        const collections = await client.request(readCollections());
        const favCol = collections.find(c => c.collection === 'favorite_combinations');

        if (favCol) {
            console.log('Collection favorite_combinations exists.');
            const fields = await client.request(readFields());
            console.log('Fields:', fields.filter(f => f.collection === 'favorite_combinations').map(f => f.field));
        } else {
            console.log('Collection favorite_combinations does not exist.');
        }
    } catch (e) {
        console.error(e);
    }
}

check();
