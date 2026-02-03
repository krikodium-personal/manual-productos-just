import { createDirectus, rest, updateItem, authentication } from '@directus/sdk';
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
        console.log("Updating Need 1 with image...");
        await client.request(updateItem('needs', 1, {
            image: '000de91e-774c-4387-a2b5-6066f70e6216'
        }));
        console.log("Update successful.");
    } catch (error) {
        console.error(error);
    }
}
main();
