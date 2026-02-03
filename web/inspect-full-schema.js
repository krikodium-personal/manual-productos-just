
const { createDirectus, rest, readFields } = require('@directus/sdk');

async function inspectSchema() {
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

        console.log('Fetching products fields...');
        const fieldsRes = await fetch(`${url}/fields/products`, { headers });
        const fieldsData = await fieldsRes.json();
        const usageField = fieldsData.data.find(f => f.field === 'usage_modes');

        if (usageField) {
            console.log('usage_modes field:', usageField);
            // Check relation
            const relationRes = await fetch(`${url}/relations/products/usage_modes`, { headers });
            const relationData = await relationRes.json();
            console.log('Relation:', relationData);
        } else {
            console.log('usage_modes field not found in products');
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

inspectSchema();
