
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

    // Get Field info
    const field = await fetch(`${DIRECTUS_URL}/fields/categories/parent`, { headers }).then(r => r.json());
    console.log('Field Parent:', JSON.stringify(field.data, null, 2));

    // Get Relation info
    const relations = await fetch(`${DIRECTUS_URL}/relations?filter[collection][_eq]=categories&filter[field][_eq]=parent`, { headers }).then(r => r.json());
    console.log('Relation Parent:', JSON.stringify(relations.data, null, 2));

    // List current categories to ensure they exist
    const cats = await fetch(`${DIRECTUS_URL}/items/categories`, { headers }).then(r => r.json());
    console.log('Existing Categories:', JSON.stringify(cats.data, null, 2));
}

run();
