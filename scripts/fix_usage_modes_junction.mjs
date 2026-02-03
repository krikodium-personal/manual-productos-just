
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

    console.log('Adding "is_recommended" to products_usage_modes...');

    // 1. Add the boolean field to the junction table
    await fetch(`${DIRECTUS_URL}/fields/products_usage_modes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            field: 'is_recommended',
            type: 'boolean',
            schema: {
                default_value: true
            },
            meta: {
                interface: 'boolean',
                display: 'boolean',
                note: 'Check if Recommended (Green). Uncheck if Not Recommended (Red).',
                width: 'half'
            }
        })
    });

    // 2. Update the Products Interface to show this field in the drawer/list
    // For 'list-m2m', we don't strictly *need* to define 'fields' to enable editing (it opens the junction form),
    // but showing it in the table is nice.
    console.log('Updating products.usage_modes interface to show the status...');

    await fetch(`${DIRECTUS_URL}/fields/products/usage_modes`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            meta: {
                interface: 'list-m2m',
                options: {
                    enableCreate: false,
                    enableSelect: true,
                    template: '{{usage_mode_id.title}}',
                    // To show the boolean toggle in the list itself, proper setup is tricky in M2M list.
                    // But usually, clicking the row opens the edit drawer where 'is_recommended' will be visible 
                    // IF it exists in the junction collection.
                }
            }
        })
    });

    console.log('Done.');
}

run();
