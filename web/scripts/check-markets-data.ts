
import { createDirectus, rest, readItems, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Fetching product_markets...");
        // Fetch product_markets with country_id expanded
        const markets = await client.request(readItems('product_markets', {
            fields: ['id', 'product_id', 'country_id', 'country_id.name']
        }));

        console.log('Product Markets Data:', JSON.stringify(markets, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
