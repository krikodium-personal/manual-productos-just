const { createDirectus, rest, staticToken, readCollections } = require('@directus/sdk');

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
        console.log(collections.map(c => c.collection).filter(c => c.includes('vehic')));
    } catch (e) {
        console.error(e);
    }
}

check();
