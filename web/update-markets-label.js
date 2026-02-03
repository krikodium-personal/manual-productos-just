const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function updateMarketsLabel() {
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

        const collection = 'products';
        const field = 'markets'; // Determined from previous inspect output

        console.log(`Updating label for ${collection} -> ${field}...`);

        await fetch(`${url}/fields/${collection}/${field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    translations: [{
                        language: 'es-ES',
                        translation: 'Mercados, precios y variantes'
                    }]
                }
            })
        });

        console.log('Label updated.');

    } catch (error) {
        console.error('Error:', error);
    }
}

updateMarketsLabel();
