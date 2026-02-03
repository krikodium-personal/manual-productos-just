const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function deleteCollection() {
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

        const collection = 'market_variants'; // Legacy
        console.log(`Deleting collection ${collection} NO LONGER USED...`);

        await fetch(`${url}/collections/${collection}`, {
            method: 'DELETE',
            headers
        });

        console.log('Collection deleted.');

    } catch (error) {
        console.error('Error:', error);
    }
}

deleteCollection();
