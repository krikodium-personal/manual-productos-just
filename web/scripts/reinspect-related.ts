
import { createDirectus, rest, readField, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Reading field 'related_products' from 'products'...");
        const field = await client.request(readField('products', 'related_products'));

        console.log(JSON.stringify(field.meta, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
