import { createDirectus, rest, readField, authentication } from '@directus/sdk';
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

        console.log("Inspecting 'products.photo' field...");
        const productPhoto = await client.request(readField('products', 'photo'));
        console.log("Interface:", productPhoto.meta?.interface);
        console.log("Special:", productPhoto.meta?.special);
        console.log("Validation:", productPhoto.meta?.validation);

    } catch (error) {
        console.error(error);
    }
}
main();
