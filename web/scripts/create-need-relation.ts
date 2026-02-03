import { createDirectus, rest, createRelation, authentication } from '@directus/sdk';
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

        console.log("Creating relation for 'needs.image' -> 'directus_files'...");
        await client.request(createRelation({
            collection: 'needs',
            field: 'image',
            related_collection: 'directus_files',
            meta: {
                one_collection: 'directus_files',
                many_collection: 'needs',
                many_field: 'image'
            },
            schema: {
                table: 'needs',
                column: 'image',
                foreign_key_table: 'directus_files',
                foreign_key_column: 'id'
            }
        }));
        console.log("Relation created successfully.");

    } catch (error: any) {
        console.error("Error creating relation:", error);
        if (error?.errors) {
            console.error("Details:", JSON.stringify(error.errors, null, 2));
        }
    }
}
main();
