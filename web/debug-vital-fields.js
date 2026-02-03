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

        // Inspect vital_just_content
        console.log('--- Fields for vital_just_content ---');
        const response1 = await fetch(`${url}/fields/vital_just_content`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data1 = await response1.json();
        console.log(JSON.stringify(data1.data.map(f => ({
            field: f.field,
            type: f.type,
            interface: f.meta?.interface
        })), null, 2));

        // Check for any potential related collection for "Lines" if it's not a JSON field
        // Usually relations are indicated in the field type or we might see a separate collection.
        // Let's assume we might need to look for collections with "line" in the name or related to vital_just

    } catch (error) {
        console.error('Error:', error);
    }
}

checkFields();
