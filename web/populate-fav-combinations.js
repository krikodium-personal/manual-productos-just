const { createDirectus, rest, staticToken, createItem } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function populate() {
    try {
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const client = createDirectus(url).with(rest()).with(staticToken(token));

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
            await client.request(createItem('favorite_combinations', {
                name: comb.name,
                description: comb.description,
                recipe: comb.recipe,
                products: comb.products.map(pid => ({ products_id: { id: pid } }))
            }));
        }

        console.log('Done!');
    } catch (e) {
        console.error('Failed to populate combinations:', e);
    }
}

populate();
