
const { createDirectus, rest, staticToken, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function configureJunctionInterface() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });

        if (!authResponse.ok) {
            throw new Error('Authentication failed');
        }

        const authData = await authResponse.json();
        const token = authData.data.access_token;
        console.log('Authenticated as admin');

        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Updating usage_mode_id interface in products_usage_modes...');

        try {
            await client.request(updateField('products_usage_modes', 'usage_mode_id', {
                meta: {
                    hidden: false, // Make it visible
                    interface: 'select-dropdown-m2o', // Dropdown
                    options: {
                        template: '{{title}}' // Show title of the usage mode
                    },
                    display_options: {
                        template: '{{title}}'
                    },
                    width: 'full'
                }
            }));
            console.log('Field usage_mode_id configured successfully!');
        } catch (e) {
            console.error('Error updating field:', e);
        }

    } catch (error) {
        console.error('Script failed:', error);
    }
}

configureJunctionInterface();
