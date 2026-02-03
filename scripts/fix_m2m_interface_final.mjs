
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

    // 1. Ensure the collections themselves have a main display template
    // This helps Directus know how to represent an item of "Attributes" generally.
    const cols = ['attributes', 'ingredients', 'needs', 'usage_modes'];

    for (const c of cols) {
        console.log(`Setting global display for collection: ${c}`);
        let template = '{{name}}';
        if (c === 'usage_modes') template = '{{title}}';

        await fetch(`${DIRECTUS_URL}/collections/${c}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    display_template: template
                }
            })
        });
    }

    // 2. Update the M2M Field Interface options in Products
    // This controls how the list looks IN THE FORM.
    const updates = [
        { field: 'attributes', template: '{{attribute_id.name}}' },
        { field: 'ingredients', template: '{{ingredient_id.name}}' },
        { field: 'needs', template: '{{need_id.name}}' },
        { field: 'usage_modes', template: '{{usage_mode_id.title}}' }
    ];

    for (const up of updates) {
        console.log(`Fixing INTERFACE for products.${up.field}...`);
        const resp = await fetch(`${DIRECTUS_URL}/fields/products/${up.field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    options: {
                        enableCreate: false, // Keep this setting we liked
                        enableSelect: true,
                        template: up.template // THIS IS THE KEY for the form list
                    }
                }
            })
        });

        if (resp.ok) console.log('Fixed Interface.');
        else console.error('Failed:', await resp.text());
    }
}

run();
