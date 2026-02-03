
const { createDirectus, rest, staticToken, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function configureDisplayTemplate() {
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

        console.log('Updating display template for usage_modes.application_amount...');

        // Update Interface Options (for the form)
        // and Display Options (for the table)
        try {
            await client.request(updateField('usage_modes', 'application_amount', {
                meta: {
                    options: {
                        template: '{{name}} - {{amount}} {{unit}}' // Shows "Name - Amount Unit"
                    },
                    display_options: {
                        template: '{{name}} - {{amount}} {{unit}}'
                    }
                }
            }));
            console.log('Display template updated successfully to {{name}} - {{amount}} {{unit}}');
        } catch (e) {
            console.error('Error updating field:', e);
        }

    } catch (error) {
        console.error('Script failed:', error);
    }
}

configureDisplayTemplate();
