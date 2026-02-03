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
        // Trying 'needs' collection first
        console.log("Checking 'needs' collection...");
        try {
            const fields = await client.request(readFieldsByCollection('needs'));
            console.log("Fields in 'needs':", fields.map(f => f.field));
            const suggested = fields.find(f => f.field === 'suggested_products');
            if (suggested) {
                console.log("suggested_products schema:", JSON.stringify(suggested, null, 2));
            }
        } catch (e: any) {
            console.log("Error checking 'needs':", e.message);
            // Maybe it's called 'categories' or 'benefits' or 'terminology'?
            // But existing code uses 'needs.need_id', so 'needs' is likely the junction, 'need_id' points to the actual collection.
            // If 'needs' is the junction, need_id points to... ?
            // I'll try to inspect the 'products' collection relation 'needs' to see what it points to if I can.
            // But for now let's hope 'needs' is the collection name for the entity.
        }
    } catch (error) {
        console.error(error);
    }
}
main();
