
// CONFIGURATION
const DIRECTUS_URL = 'https://directus-production-4078.up.railway.app';
const EMAIL = 'admin@example.com';
const PASSWORD = 'password';

async function login() {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const data = await res.json();
    return data.data.access_token;
}

async function run() {
    const token = await login();
    const headers = { Authorization: `Bearer ${token}` };

    console.log('--- PRODUCTS FIELDS ---');
    const fieldsRes = await fetch(`${DIRECTUS_URL}/fields/products`, { headers });
    const fields = await fieldsRes.json();
    console.log(JSON.stringify(fields.data.map(f => ({
        field: f.field,
        label: f.meta?.label,
        sort: f.meta?.sort,
        hidden: f.meta?.hidden,
        group: f.meta?.group
    })), null, 2));

    console.log('\n--- RELATIONS ---');
    const relRes = await fetch(`${DIRECTUS_URL}/relations`, { headers });
    const rels = await relRes.json();
    const relevantRels = rels.data.filter(r =>
        r.collection === 'product_variants' ||
        r.related_collection === 'product_variants'
    );
    console.log(JSON.stringify(relevantRels, null, 2));
}

run();
