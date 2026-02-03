const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function hideCollection() {
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

        const collection = 'product_market_prices';
        console.log(`Hiding collection ${collection}...`);

        await fetch(`${url}/collections/${collection}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    hidden: true // Hides from sidebar navigation
                }
            })
        });

        console.log('Collection hidden.');

    } catch (error) {
        console.error('Error:', error);
    }
}

hideCollection();
