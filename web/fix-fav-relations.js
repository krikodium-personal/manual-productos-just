const { createDirectus, rest, staticToken } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function fixRelations() {
    try {
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const relations = [
            {
                collection: 'favorite_combinations_products',
                field: 'favorite_combinations_id',
                related_collection: 'favorite_combinations',
                meta: {
                    one_field: 'products'
                }
            },
            {
                collection: 'favorite_combinations_products',
                field: 'products_id',
                related_collection: 'products',
                meta: null
            }
        ];

        for (const rel of relations) {
            console.log(`Creating relation for ${rel.collection}.${rel.field}...`);
            await fetch(`${url}/relations`, {
                method: 'POST',
                headers,
                body: JSON.stringify(rel)
            });
        }

        console.log('Done!');
    } catch (e) {
        console.error('Fix failed:', e);
    }
}

fixRelations();
