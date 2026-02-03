const { createDirectus, rest, readFields, readItems } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function checkOtherFields() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = { 'Authorization': `Bearer ${token}` };

        // Helper to fetch fields
        async function getFields(col) {
            const res = await fetch(`${url}/fields/${col}`, { headers });
            const json = await res.json();
            return json.data.map(f => f.field);
        }

        console.log('fields(vital_just_content):', await getFields('vital_just_content'));
        console.log('fields(vital_just_tips):', await getFields('vital_just_tips'));
        console.log('fields(vital_just_flyers):', await getFields('vital_just_flyers'));

        // Check if there is data in vital_just_content
        const resContent = await fetch(`${url}/items/vital_just_content`, { headers });
        const contentData = await resContent.json();
        console.log('items(vital_just_content):', JSON.stringify(contentData.data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkOtherFields();
