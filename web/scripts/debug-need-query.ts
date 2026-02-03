import { createDirectus, rest, readItems, authentication } from '@directus/sdk';
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Running specific query for need 'tranquilidad'...");
        const result = await client.request(readItems('needs', {
            filter: { slug: { _eq: 'tranquilidad' } },
            fields: [
                '*',
                'suggested_products.product_id.id',
                'suggested_products.product_id.name',
                'suggested_products.product_id.slug',
                'suggested_products.product_id.photo'
            ],
            limit: 1
        }));

        if (result && result.length > 0) {
            console.log("Need Data:", JSON.stringify(result[0], null, 2));
            const need = result[0];
            if (need.suggested_products) {
                console.log("Type of suggested_products:", typeof need.suggested_products);
                console.log("Is Array:", Array.isArray(need.suggested_products));
                if (Array.isArray(need.suggested_products)) {
                    console.log("First item:", need.suggested_products[0]);
                }
            }
        } else {
            console.log("Need not found.");
        }
    } catch (error) {
        console.error(error);
    }
}
main();
