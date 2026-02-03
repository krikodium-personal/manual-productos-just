
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

    console.log('Fetching fields for products...');
    const fields = await fetch(`${DIRECTUS_URL}/fields/products`, { headers }).then(r => r.json());

    if (fields.data) {
        const suspectFields = ['ingredients', 'needs', 'attributes', 'usage_modes'];
        fields.data.forEach(f => {
            if (suspectFields.includes(f.field)) {
                console.log(`Field ${f.field}: type=${f.type}, special=${f.meta?.special}`);
            }
        });
    } else {
        console.log('Error fetching fields:', fields);
    }
}

run();
