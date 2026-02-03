
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

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log('1. Fixing "parent" field to be a simple Dropdown with Name...');
    await fetch(`${DIRECTUS_URL}/fields/categories/parent`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            meta: {
                interface: 'select-dropdown-m2o', // Specific M2O dropdown is safer
                options: {
                    template: '{{name}}'
                },
                display: 'related-values',
                display_options: {
                    template: '{{name}}'
                }
            }
        })
    });

    console.log('2. Creating "children" field (O2M) to see Subcategories inside Parent...');
    // This allows the user to go into "Rostro" and see a list of "Children" and click "Create New" which will auto-set the parent to "Rostro".
    const aliasRes = await fetch(`${DIRECTUS_URL}/fields/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            field: 'children',
            type: 'alias',
            schema: null,
            meta: {
                interface: 'list-o2m',
                special: ['o2m'],
                display: 'related-values',
                display_options: {
                    template: '{{name}}'
                }
            }
        })
    });

    // Checking if created or failed (might already exist if I tried earlier implicitly)
    if (aliasRes.status !== 200 && aliasRes.status !== 204) {
        console.log('Alias creation response:', await aliasRes.text());
    }

    // We need to ensure the relation knows about this alias?
    // Actually, for O2M alias, we might need to update the RELATION object to specify the "one_field" (which is the alias on the parent side).
    // The relation exists on "categories.parent".

    console.log('3. Linking relation to the new "children" alias...');
    await fetch(`${DIRECTUS_URL}/relations/categories/parent`, { // endpoint is /relations/:collection/:field
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            meta: {
                one_field: 'children', // This tells Directus: "The 'parent' field on the many side matches the 'children' field on the one side"
            }
        })
    });

    console.log('Done. Refresh Directus.');
}

run();
