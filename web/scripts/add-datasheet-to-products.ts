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

        console.log("Adding 'datasheet' field to 'products'...");

        await client.request(createField('products', {
            field: 'datasheet',
            type: 'uuid',
            meta: {
                interface: 'file', // Standard file interface
                special: ['file'], // Helper to indicate it's a file
                display: 'file',
                readonly: false,
                hidden: false,
                width: 'full',
                translations: [
                    { language: 'es-ES', translation: 'Ficha de producto' },
                    { language: 'es-419', translation: 'Ficha de producto' },
                    { language: 'en-US', translation: 'Product Sheet' }
                ],
                note: 'Sube la ficha técnica del producto (PDF idealmente).'
            },
            schema: {
                foreign_key_table: 'directus_files',
                foreign_key_column: 'id', // This might be handled automatically by Directus logic for 'file' special, but verifying.
                // Actually, for creating a relational field via SDK, we usually rely on Directus to infer the constraint if we set the correct type/meta.
                // But explicitly setting it ensures the foreign key is created.
            }
        }));

        console.log("Field 'datasheet' created successfully!");

    } catch (error: any) {
        console.error("Error creating field:", error.message);
        if (error.errors) {
            console.error("Details:", JSON.stringify(error.errors, null, 2));
        }
    }
}
main();
