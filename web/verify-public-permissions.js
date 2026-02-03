const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function verifyPermissions() {
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

        const collections = [
            'product_markets',
            'product_market_prices',
            'variants'
        ];

        for (const col of collections) {
            console.log(`Checking permissions for ${col}...`);
            const check = await fetch(`${url}/permissions?filter[role][_null]=true&filter[collection][_eq]=${col}&filter[action][_eq]=read`, { headers });
            const checkData = await check.json();

            if (checkData.data && checkData.data.length > 0) {
                console.log(`- Fields permission:`, checkData.data[0].fields);
            } else {
                console.log(`- NO permissions found!`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyPermissions();
