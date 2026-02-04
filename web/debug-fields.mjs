
import { createDirectus, rest, readItems } from '@directus/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function debug() {
    try {
        console.log("Fetching one product from:", url);
        const products = await directus.request(readItems('products', {
            limit: 1,
            fields: ['*']
        }));

        if (products.length > 0) {
            console.log("Fields found in product:", Object.keys(products[0]));
            if (products[0].name === 'Pebble') {
                console.log("Pebble data sample:", JSON.stringify(products[0], null, 2));
            } else {
                // Fetch Pebble specifically
                const pebble = await directus.request(readItems('products', {
                    filter: { name: { _contains: 'Pebble' } },
                    limit: 1,
                    fields: ['*']
                }));
                if (pebble.length > 0) {
                    console.log("Pebble data sample:", JSON.stringify(pebble[0], null, 2));
                }
            }
        } else {
            console.log("No products found.");
        }
    } catch (err) {
        console.error("Error fetching fields:", err.message);
        if (err.response) {
            console.error("Response data:", await err.response.json());
        }
    }
}

debug();
