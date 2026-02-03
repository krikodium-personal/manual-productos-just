const { createDirectus, rest, staticToken, readFields } = require('@directus/sdk');

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
        const fields = await client.request(readFields());
        const cols = ['vehicular_content', 'vehicular_advantages', 'vehiculares'];
        cols.forEach(col => {
            console.log(`${col}:`, fields.filter(f => f.collection === col).map(f => f.field));
        });
    } catch (e) {
        console.error(e);
    }
}

check();
