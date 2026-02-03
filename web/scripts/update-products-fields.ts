import { createDirectus, rest, createField, updateField, createRelation, authentication } from '@directus/sdk';
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

        console.log("Updating 'datasheet' field translations...");
        // User wants "Ficha de producto" to be the title. We'll set it for all languages to ensure it shows up that way.
        await client.request(updateField('products', 'datasheet', {
            meta: {
                translations: [
                    { language: 'es-ES', translation: 'Ficha de producto' },
                    { language: 'es-419', translation: 'Ficha de producto' },
                    { language: 'en-US', translation: 'Ficha de producto' } // Force Spanish title even in English interface
                ]
            }
        }));
        console.log("'datasheet' updated.");

        console.log("Creating 'flyer' field...");
        try {
            await client.request(createField('products', {
                field: 'flyer',
                type: 'uuid',
                meta: {
                    interface: 'file',
                    special: ['file'],
                    display: 'file',
                    readonly: false,
                    hidden: false,
                    width: 'full',
                    translations: [
                        { language: 'es-ES', translation: 'Flyer del producto' },
                        { language: 'es-419', translation: 'Flyer del producto' },
                        { language: 'en-US', translation: 'Flyer del producto' }
                    ],
                    note: 'Sube el flyer promocional del producto.'
                },
                schema: {
                    is_nullable: true
                }
            }));
            console.log("Field 'flyer' created.");

            console.log("Creating relation for 'flyer'...");
            await client.request(createRelation({
                collection: 'products',
                field: 'flyer',
                related_collection: 'directus_files',
                schema: {
                    on_delete: 'SET NULL',
                },
                meta: {
                    sort_field: null,
                }
            }));
            console.log("Relation for 'flyer' created successfully!");

        } catch (e: any) {
            console.log("Error creating 'flyer' (might already exist):", e.message);
        }

    } catch (error: any) {
        console.error("Error:", error.message);
        if (error.errors) {
            console.error("Details:", JSON.stringify(error.errors, null, 2));
        }
    }
}
main();
