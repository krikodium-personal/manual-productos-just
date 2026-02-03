const { createDirectus, rest, staticToken, createItem } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function addProducts() {
    try {
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const client = createDirectus(url).with(rest()).with(staticToken(token));

        const oils = [
            'Aceite Esencial de Limón',
            'Aceite Esencial de Neroli',
            'Aceite Esencial de Menta',
            'Aceite Esencial de Palmarosa',
            'Aceite Esencial de Naranja',
            'Aceite Esencial de Patchouli',
            'Revitalizador Guduchi'
        ];

        for (const name of oils) {
            console.log(`Adding ${name}...`);
            await client.request(createItem('products', {
                name,
                category: 1, // Aromaterapia
                slug: name.toLowerCase().replace(/ /g, '-')
            }));
        }

        console.log('Done!');
    } catch (e) {
        console.error('Failed to add products:', e);
    }
}

addProducts();
