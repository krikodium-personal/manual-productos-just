const { createDirectus, rest, staticToken, updateCollection } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function hide() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;

        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Hiding vehicular_advantages from sidebar...');
        await client.request(updateCollection('vehicular_advantages', {
            meta: {
                hidden: true
            }
        }));

        console.log('Done!');
    } catch (e) {
        console.error('Failed to hide collection:', e);
    }
}

hide();
