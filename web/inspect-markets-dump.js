const { createDirectus, rest } = require('@directus/sdk');
const fs = require('fs');

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

        const collections = ['market_variants', 'countries', 'product_markets'];
        const result = {};

        for (const col of collections) {
            console.log(`Fetching ${col}...`);
            const response = await fetch(`${url}/fields/${col}`, { headers });
            const data = await response.json();
            if (data.data) {
                result[col] = data.data.map(f => ({ field: f.field, type: f.type }));
            } else {
                result[col] = { error: data };
            }
        }

        fs.writeFileSync('schema-dump.json', JSON.stringify(result, null, 2));
        console.log('Schema dumped to schema-dump.json');

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectSchema();
