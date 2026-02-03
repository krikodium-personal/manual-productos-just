const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function removeLegacyVariants() {
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

        const collection = 'product_markets';
        const field = 'variants'; // This was the old O2M alias

        console.log(`Removing field ${field} from ${collection}...`);

        const res = await fetch(`${url}/fields/${collection}/${field}`, {
            method: 'DELETE',
            headers
        });

        if (res.ok) {
            console.log(`Field ${field} removed.`);
        } else if (res.status === 403 || res.status === 404) {
            // In Directus, 403 might mean forbidden OR simply not found if filtering logic applies? 
            // 404 is standard not found.
            console.log(`Field ${field} not found or already removed (Status: ${res.status}).`);
        } else {
            const err = await res.json();
            console.error('Error removing field:', err);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

removeLegacyVariants();
