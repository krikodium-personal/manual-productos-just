const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function findCollection() {
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

        console.log('User Collections:');
        data.data.forEach(c => {
            if (!c.collection.startsWith('directus_')) {
                console.log(`- ID: ${c.collection}`);
                console.log(`  Translations:`, c.meta?.translations);
                console.log(`  Note:`, c.meta?.note);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

findCollection();
