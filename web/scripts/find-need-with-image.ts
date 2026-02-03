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
        const items = await client.request(readItems('needs', {
            filter: {
                _and: [
                    { image: { _is_null: false } }
                ]
            },
            limit: 5
        }));
        console.log("Needs with images found:", items.length);
        if (items.length > 0) {
            console.log("Sample ID:", items[0].id, "Image UUID:", items[0].image);
        }
    } catch (error) {
        console.error(error);
    }
}
main();
