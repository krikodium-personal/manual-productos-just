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

        const fields = await client.request(readFieldsByCollection('products'));
        console.log("Fields in 'products':", fields.map(f => f.field));
        const datasheetField = fields.find(f => f.field === 'datasheet');
        if (datasheetField) {
            console.log("Datasheet field schema:", JSON.stringify(datasheetField, null, 2));
        }
        const flyerField = fields.find(f => f.field === 'flyer');
        if (flyerField) {
            console.log("Flyer field schema:", JSON.stringify(flyerField, null, 2));
        }
    } catch (error) {
        console.error(error);
    }
}
main();
