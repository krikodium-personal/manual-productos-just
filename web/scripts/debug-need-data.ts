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

        console.log("Fetching need 'tranquilidad' with all fields...");
        const result = await client.request(readItems('needs', {
            filter: { slug: { _eq: 'tranquilidad' } },
            fields: ['*'],
            limit: 1
        }));

        if (result && result.length > 0) {
            console.log("Need Data:", JSON.stringify(result[0], null, 2));
        } else {
            console.log("Need not found.");
        }
    } catch (error) {
        console.error(error);
    }
}
main();
