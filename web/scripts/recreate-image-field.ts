import { createDirectus, rest, createField, deleteField, authentication } from '@directus/sdk';
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

        console.log("Checking and updating 'image' field in 'needs' collection...");

        try {
            await client.request(deleteField('needs', 'image'));
            console.log("Deleted existing 'image' field.");
        } catch (e) {
            console.log("Field 'image' did not exist or could not be deleted.");
        }

        console.log("Creating 'image' field with full relation metadata...");
        await client.request(createField('needs', {
            field: 'image',
            type: 'uuid',
            schema: {
                foreign_key_table: 'directus_files',
                foreign_key_column: 'id',
            },
            meta: {
                interface: 'file-image',
                special: null,
                note: 'Image for the need'
            }
        }));
        console.log("Field 'image' created successfully with uuid type.");

    } catch (error) {
        console.error(error);
    }
}
main();
