
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

    const updates = [
        { field: 'attributes', template: '{{attribute_id.name}}' },
        { field: 'ingredients', template: '{{ingredient_id.name}}' },
        { field: 'needs', template: '{{need_id.name}}' },
        { field: 'usage_modes', template: '{{usage_mode_id.title}}' }
    ];

    for (const up of updates) {
        console.log(`Fixing display for products.${up.field}...`);
        const resp = await fetch(`${DIRECTUS_URL}/fields/products/${up.field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    display: 'related-values', // Ensures it looks at the m2m configuration
                    display_options: {
                        template: up.template
                    }
                }
            })
        });

        if (resp.ok) console.log('Fixed.');
        else console.error('Failed:', await resp.text());
    }
}

run();
