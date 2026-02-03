
const { createDirectus, rest, staticToken, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function hideDefaultDrops() {
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

        console.log('Hiding default_drops field in usage_modes...');

        try {
            await client.request(updateField('usage_modes', 'default_drops', {
                meta: {
                    hidden: true,
                    interface: null // This removes the interface, effectively hiding it from the form
                }
            }));
            console.log('Field default_drops hidden successfully!');
        } catch (e) {
            console.error('Error updating field:', e);
        }

    } catch (error) {
        console.error('Script failed:', error);
    }
}

hideDefaultDrops();
