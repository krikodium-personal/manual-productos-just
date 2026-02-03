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

        const response = await fetch(`${url}/relations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        const vitalRelations = data.data.filter(r => r.collection === 'vital_just_content');
        console.log('Relations for vital_just_content:', JSON.stringify(vitalRelations, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkRelations();
