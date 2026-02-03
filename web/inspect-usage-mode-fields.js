
const { createDirectus, rest, readFields } = require('@directus/sdk');

async function inspectUsageFields() {
    try {
        const url = 'http://localhost:8055';
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        console.log('Authenticated.');

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        console.log('Fetching usage_modes fields...');
        const fieldsRes = await fetch(`${url}/fields/usage_modes`, { headers });
        const fieldsData = await fieldsRes.json();

        if (fieldsData.data) {
            console.log('Fields:', fieldsData.data.map(f => f.field));
        } else {
            console.error('Failed to fetch fields:', fieldsData);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

inspectUsageFields();
