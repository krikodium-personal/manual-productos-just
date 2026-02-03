const { createDirectus, rest, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function checkFields() {
    try {
        console.log('Authenticating via REST API...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        console.log('✅ Obtained access token.');

        // Use the token for subsequent requests
        const response = await fetch(`${url}/fields/faq`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch fields: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fields for "faq" collection:', JSON.stringify(data.data.map(f => ({
            field: f.field,
            type: f.type,
            interface: f.meta?.interface
        })), null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkFields();
