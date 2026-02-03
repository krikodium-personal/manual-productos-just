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

        console.log("Attempting to fetch 'needs_products'...");
        try {
            const result = await client.request(readItems('needs_products', {
                limit: 5,
                fields: ['*']
            }));
            console.log("needs_products data:", JSON.stringify(result, null, 2));
        } catch (e) {
            console.log("Could not fetch 'needs_products'. Trying to list fields of 'needs' to find junction name.");
            // If this fails, we can assume the collection name might be different or permissions are off.
        }
    } catch (error) {
        console.error(error);
    }
}
main();
