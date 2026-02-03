const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function listCollections() {
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

        const response = await fetch(`${url}/collections`, { headers });
        const data = await response.json();

        console.log('Collections:');
        data.data.forEach(c => {
            // Log ID and translations to find "Folletos"
            const translations = c.meta?.translations;
            console.log(`- ID: ${c.collection} | Note: ${c.meta?.note} | Translations:`, translations);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

listCollections();
