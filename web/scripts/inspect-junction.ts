
import { createDirectus, rest, readItems, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Reading 'products_products' junction items...");
        const junction = await client.request(readItems('products_products'));
        console.log("Junction Table:", JSON.stringify(junction, null, 2));

        // Re-test deep fetch with standard M2M syntax
        const id = 4;
        const result = await client.request(readItems('products', {
            filter: { id: { _eq: id } },
            fields: [
                'id',
                'related_products', // This usually just gives IDs
                'related_products.products_products_id', // Primary key of junction? Usually just 'id' if using standard fields
                // The related field in junction table is 'related_products_id' (as seen in prev inspect)
                'related_products.related_products_id.id',
                'related_products.related_products_id.name'
            ]
        }));
        console.log("Deep Fetch Result:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
