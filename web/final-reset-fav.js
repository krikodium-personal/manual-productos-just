const { createDirectus, rest, staticToken, readItems, deleteItems } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function reset() {
    try {
        console.log('Authenticating...');
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

        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Deleting junction table items...');
        const junctions = await client.request(readItems('favorite_combinations_products', { fields: ['id'] }));
        if (junctions.length > 0) {
            await client.request(deleteItems('favorite_combinations_products', junctions.map(j => j.id)));
        }

        console.log('Deleting main table items...');
        const mainItems = await client.request(readItems('favorite_combinations', { fields: ['id'] }));
        if (mainItems.length > 0) {
            await client.request(deleteItems('favorite_combinations', mainItems.map(m => m.id)));
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
            console.log(`Adding combination ${comb.name}...`);
            await fetch(`${url}/items/favorite_combinations`, {
                method: 'POST',
                headers,
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
