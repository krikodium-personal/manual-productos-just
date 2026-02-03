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
        const items = await client.request(readItems('needs', { limit: 1 }));
        console.log("Need Item:", JSON.stringify(items[0], null, 2));
    } catch (error) {
        console.error(error);
    }
}
main();
