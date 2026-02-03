const { createDirectus, rest, staticToken, readItems, deleteItem, createItem } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function reset() {
    try {
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Fetching all IDs...');
        const items = await client.request(readItems('favorite_combinations', { fields: ['id'] }));

        for (const item of items) {
            console.log(`Deleting ${item.id}...`);
            await client.request(deleteItem('favorite_combinations', item.id));
        }

        const combinations = [
            {
                name: "Alegría",
                description: "Ideal para levantar el ánimo y disipar la melancolía.",
                recipe: "6 gotas de cada aceite esencial en 10ml de Bruma o Aceite Vehicular Aromablends.",
                products: [5, 15, 16] // Bergamota, Limón, Neroli
            },
            {
                name: "Foco",
                description: "Ayuda a mantener la concentración y la productividad.",
                recipe: "6 gotas de cada aceite esencial en 10ml de Bruma o Aceite Vehicular Aromablends.",
                products: [17, 15, 18] // Menta, Limón, Palmarosa
            },
            {
                name: "Tranquilidad",
                description: "Promueve la relajación y el descanso profundo.",
                recipe: "6 gotas de cada aceite esencial en 10ml de Bruma o Aceite Vehicular Aromablends.",
                products: [10, 19, 18] // Lavanda, Naranja, Palmarosa
            }
        ];

        for (const comb of combinations) {
            console.log(`Adding ${comb.name}...`);
            await fetch(`${url}/items/favorite_combinations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: comb.name,
                    description: comb.description,
                    recipe: comb.recipe,
                    products: comb.products.map(pid => ({ products_id: { id: pid } }))
                })
            });
        }

        console.log('Done!');
    } catch (e) {
        console.error('Reset failed:', e);
    }
}

reset();
