const { createDirectus, rest, readRelations } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function checkRelations() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;

        console.log('Fetching relations...');
        // We can't easily filter readRelations by collection in SDK v11+ typical usage?
        // Let's us direct fetch with filter

        const response = await fetch(`${url}/relations?filter[collection][_in]=vital_just_tips,aromatherapy_tips`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        console.log('Relations found:', JSON.stringify(data.data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkRelations();
