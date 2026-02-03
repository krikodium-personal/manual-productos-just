
import { createDirectus, rest, readItems, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        const products = await client.request(readItems('products', {
            fields: ['id', 'name']
        }));

        console.log('Current Products:', JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
