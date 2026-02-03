const { createDirectus, rest, readFields } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function checkAromaFields() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;

        console.log('Fetching aromatherapy_tips fields...');
        const response = await fetch(`${url}/fields/aromatherapy_tips`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        console.log(JSON.stringify(data.data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkAromaFields();
