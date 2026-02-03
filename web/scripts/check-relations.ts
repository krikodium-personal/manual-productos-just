import { createDirectus, rest, readRelations, authentication } from '@directus/sdk';
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
        const relations = await client.request(readRelations());
        const needRelation = relations.find(r => r.collection === 'needs' && r.field === 'image');
        const productRelation = relations.find(r => r.collection === 'products' && r.field === 'photo');

        console.log("Need Relation:", JSON.stringify(needRelation, null, 2));
        console.log("Product Relation:", JSON.stringify(productRelation, null, 2));
    } catch (error) {
        console.error(error);
    }
}
main();
