import { createDirectus, rest, createField, authentication } from '@directus/sdk';
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
        console.log("Adding 'image' field to 'needs' collection...");

        try {
            await client.request(createField('needs', {
                field: 'image',
                type: 'string', // Directus stores file IDs as strings (uuids)
                schema: {
                    default_value: null,
                    is_nullable: true,
                },
                meta: {
                    interface: 'file-image', // Use image interface
                    special: ['file'], // It's a file
                    note: 'Image for the need'
                }
            }));
            console.log("Field 'image' created successfully.");
        } catch (error: any) {
            if (error?.errors?.[0]?.extensions?.code === 'FIELD_DUPLICATE' || error?.message?.includes('Duplicate')) {
                console.log("Field 'image' already exists.");
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error(error);
    }
}
main();
