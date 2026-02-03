
import { createDirectus, rest, readItem, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        // Use ID 4 as seen in the user log
        const id = 4;

        console.log(`Fetching product ${id} with related_products...`);

        const result = await client.request(readItem('products', id, {
            fields: [
                'id',
                'name',
                // Try fetching just the alias first to see if it comes as array of IDs or objects
                'related_products',
                // Then deep
                'related_products.related_product_id.id',
                'related_products.related_product_id.name'
            ]
        }));

        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
