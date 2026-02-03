
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
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const aliases = ['ingredients', 'needs', 'attributes', 'usage_modes'];

    for (const field of aliases) {
        console.log(`Fixing ${field}...`);

        // 1. Delete (if exists)
        await fetch(`${DIRECTUS_URL}/fields/products/${field}`, { method: 'DELETE', headers });

        // 2. Re-create strictly
        const body = {
            field: field,
            type: 'alias', // STRICTLY ALIAS
            schema: null,   // STRICTLY NULL (No DB column)
            meta: {
                interface: 'list-m2m',
                special: ['m2m'],
                display: 'related-values',
                display_options: { template: '{{name}}' } // Assuming related tables have 'name' or similar
            }
        };

        // Adjust display template for usage_modes (title)
        if (field === 'usage_modes') {
            body.meta.display_options.template = '{{title}}';
        }

        const createRes = await fetch(`${DIRECTUS_URL}/fields/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (createRes.status !== 200) {
            console.error(`Failed to recreate ${field}:`, await createRes.text());
        } else {
            console.log(`Recreated ${field}`);
        }
    }
}

run();
