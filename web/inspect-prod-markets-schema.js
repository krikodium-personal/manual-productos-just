const { createDirectus, rest, readFields } = require('@directus/sdk');

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

        console.log('Fetching fields for product_markets...');
        const response = await fetch(`${url}/fields/product_markets`, { headers });
        const fields = await response.json();

        // Log relation fields
        const relevant = fields.data.filter(f => {
            const isForeignKey = f.schema ? f.schema.foreign_key_column === 'market_id' : false;
            return isForeignKey || ['variants', 'prices'].includes(f.field);
        });

        console.log('Relevant fields in product_markets:', relevant.map(f => ({
            field: f.field,
            type: f.type,
            schema: f.schema
        })));

        // Also check if 'variants' exists as an alias
        const variants = fields.data.find(f => f.field === 'variants');
        if (variants) console.log('Found variants field:', variants);

        const prices = fields.data.find(f => f.field === 'prices');
        if (prices) console.log('Found prices field:', prices);

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectSchema();
