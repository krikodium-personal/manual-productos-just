import { createDirectus, rest, readFieldsByCollection, authentication } from '@directus/sdk';
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
        console.log("Checking 'products_needs' collection...");
        try {
            const fields = await client.request(readFieldsByCollection('products_needs'));
            console.log("Fields in 'products_needs':", fields.map(f => f.field));
        } catch (e: any) {
            console.log("Error checking 'products_needs':", e.message);
        }
    } catch (error) {
        console.error(error);
    }
}
main();
