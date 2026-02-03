const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function inspectFlyersDetail() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('Fetching detailed fields for vital_just_flyers...');
        const response = await fetch(`${url}/fields/vital_just_flyers`, { headers });
        const data = await response.json();

        if (data.data) {
            console.log('Detailed Fields:');
            data.data.forEach(f => {
                if (['image', 'file'].includes(f.field)) {
                    console.log(`Field: ${f.field}`);
                    console.log(`  Type: ${f.type}`);
                    console.log(`  Schema:`, f.schema);
                    console.log(`  Meta:`, f.meta);
                }
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectFlyersDetail();
