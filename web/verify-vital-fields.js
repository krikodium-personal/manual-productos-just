const { createDirectus, rest, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function checkFields() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;

        console.log('Fetching fields...');
        const response = await fetch(`${url}/fields/vital_just_content`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        const fields = data.data.map(f => f.field);
        console.log('Current Fields:', fields);

    } catch (error) {
        console.error('Error:', error);
    }
}

checkFields();
