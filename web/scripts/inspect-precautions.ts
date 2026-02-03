import { createDirectus, rest, readItem, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function inspectPrecautions() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Fetching Product 4 precautions...");
        const result = await client.request(readItem('products', 4, {
            fields: [
                'id',
                'name',
                'specific_precautions'
            ]
        }));

        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectPrecautions();
