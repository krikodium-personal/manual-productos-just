
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
    const token = data.data.access_token;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log('Updating "parent" field metadata...');

    // Update the Field Metadata to use a better Interface and Display
    const updateRes = await fetch(`${DIRECTUS_URL}/fields/categories/parent`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            meta: {
                interface: 'select-dropdown', // or 'select-tree' if preferred, but dropdown is simpler to debug
                options: {
                    template: '{{name}}' // Show the name in the dropdown
                },
                display: 'related-values',
                display_options: {
                    template: '{{name}}' // Show the name in the list view
                }
            }
        })
    });

    if (updateRes.status === 200) {
        console.log('Success! Parent field now shows names.');
    } else {
        console.error('Update failed:', await updateRes.text());
    }
}

run();
