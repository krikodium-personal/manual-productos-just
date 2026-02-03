
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

    console.log('Switching to select-tree interface...');

    const updateRes = await fetch(`${DIRECTUS_URL}/fields/categories/parent`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            meta: {
                interface: 'select-dropdown-m2o', // Let's try the specific M2O dropdown first, it's more robust than generic select-dropdown
                // actually, 'select-dropdown-m2o' is the system one. standard is 'select-dropdown'.
                // Wait, let's go with 'select-tree' as planned.
                interface: 'select-tree',
                options: {
                    // template: '{{name}}' // select-tree uses a different config usually?
                    // It guesses display template or uses collection display.
                    display_template: '{{name}}'
                },
                display: 'related-values',
                display_options: {
                    template: '{{name}}'
                }
            }
        })
    });

    console.log('Update status:', updateRes.status);
    console.log('Response:', await updateRes.text());
}

run();
