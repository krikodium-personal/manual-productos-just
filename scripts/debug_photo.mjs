
const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'admin@example.com';
const PASSWORD = 'password';

async function run() {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const data = await res.json();
    const token = data.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('Fetching photo field for products...');
    const field = await fetch(`${DIRECTUS_URL}/fields/products/photo`, { headers }).then(r => r.json());
    console.log(JSON.stringify(field, null, 2));
}

run();
