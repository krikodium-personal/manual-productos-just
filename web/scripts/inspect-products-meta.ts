
import { createDirectus, rest, readCollection, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Reading collection 'products'...");
        const collection = await client.request(readCollection('products'));

        console.log(JSON.stringify(collection.meta, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
