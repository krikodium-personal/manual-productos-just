
// Native fetch in Node 18+

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'admin@example.com';
const PASSWORD = 'password';

async function run() {
    console.log('Logging in...');
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const data = await res.json();
    if (data.errors) {
        console.error('Login failed', data.errors);
        process.exit(1);
    }
    const token = data.data.access_token;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log('Creating "parent" field on categories...');
    // 1. Create Field
    const fieldRes = await fetch(`${DIRECTUS_URL}/fields/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            field: 'parent',
            type: 'integer', // Assuming ID is integer. If UUID, change to 'uuid'.
            schema: {},
            meta: {
                interface: 'select-tree', // The magic interface for hierarchical data
                special: ['cast-m2o']
            }
        })
    });

    if (fieldRes.status !== 200 && fieldRes.status !== 204) {
        const txt = await fieldRes.text();
        if (txt.includes('already exists') || txt.includes('RECORD_NOT_UNIQUE')) {
            console.log('Field "parent" already exists. Proceeding to check relation.');
        } else {
            console.error('Field creation failed:', txt);
        }
    }

    console.log('Creating metadata/relation for "parent"...');
    // 2. Create Relation
    const relRes = await fetch(`${DIRECTUS_URL}/relations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            collection: 'categories',
            field: 'parent',
            related_collection: 'categories',
            schema: { onDelete: 'SET NULL' }
        })
    });

    if (relRes.status !== 200 && relRes.status !== 204) {
        const txt = await relRes.text();
        if (txt.includes('Item already exists') || txt.includes('RECORD_NOT_UNIQUE')) {
            console.log('Relation already exists.');
        } else {
            console.error('Relation creation failed:', txt);
        }
    }

    console.log('Done. Please refresh Directus to see the "Parent" field.');
}

run();
