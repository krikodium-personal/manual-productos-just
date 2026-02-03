import { createDirectus, rest, createField, deleteField, createRelation, authentication } from '@directus/sdk';
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

        console.log("Deleting existing 'datasheet' field...");
        try {
            await client.request(deleteField('products', 'datasheet'));
            console.log("Field deleted.");
        } catch (e: any) {
            console.log("Field deletion failed (might not exist):", e.message);
        }

        console.log("Creating 'datasheet' field...");
        await client.request(createField('products', {
            field: 'datasheet',
            type: 'uuid',
            meta: {
                interface: 'file',
                special: ['file'],
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
                // Ensure the column is created
                is_nullable: true
            }
        }));
        console.log("Field 'datasheet' created.");

        console.log("Creating relation to 'directus_files'...");
        await client.request(createRelation({
            collection: 'products',
            field: 'datasheet',
            related_collection: 'directus_files',
            schema: {
                // Database level constraints
                on_delete: 'SET NULL',
            },
            meta: {
                // UI configuration for the relational interface
                sort_field: null,
            }
        }));
        console.log("Relation created successfully!");

    } catch (error: any) {
        console.error("Error:", error.message);
        if (error.errors) {
            console.error("Details:", JSON.stringify(error.errors, null, 2));
        }
    }
}
main();
