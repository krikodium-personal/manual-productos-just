const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function inspectSchema() {
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

        const collections = ['market_variants', 'countries', 'product_markets', 'products'];

        for (const col of collections) {
            console.log(`\n--- Fields for ${col} ---`);
            const response = await fetch(`${url}/fields/${col}`, { headers });
            const data = await response.json();
            if (data.data) {
                data.data.forEach(f => {
                    console.log(`- ${f.field} (${f.type})`);
                });
            } else {
                console.log(`Error or not found:`, data);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectSchema();
