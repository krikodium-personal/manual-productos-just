
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
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    console.log('Updating "attributes" field interface...');

    // We want to use list-m2m but DISABLE creation.
    // This forces the user to pick from existing attributes.
    await fetch(`${DIRECTUS_URL}/fields/products/attributes`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            meta: {
                interface: 'list-m2m',
                options: {
                    enableCreate: false, // This is the key
                    enableSelect: true,
                    layout: 'list', // or 'grid'
                }
            }
        })
    });

    console.log('Ideally, for "Checkboxes" style, we would need a specific interface,');
    console.log('but disabling Create ensures separation.');
}

run();
