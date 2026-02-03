import { createDirectus, rest, readCollections, createCollection, createField, updateCollection, authentication } from '@directus/sdk';
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(authentication())
    .with(rest());
// Removed staticToken, using login() in main function

async function setupTerminology() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Logged in as admin');

        console.log('Checking for terminology collection...');
        const collections = await client.request(readCollections());
        const existing = collections.find((c: any) => c.collection === 'terminology');

        if (!existing) {
            console.log('Creating terminology collection...');
            await client.request(createCollection({
                collection: 'terminology',
                schema: {},
                meta: {
                    singleton: true, // Specific singleton setting
                    icon: 'book',
                    note: 'Terminology and methodology definitions',
                    sort: 1
                }
            }));
        } else {
            console.log('Terminology collection exists. Updating meta to ensure singleton...');
            await client.request(updateCollection('terminology', {
                meta: {
                    singleton: true
                }
            }));
        }

        // Define fields
        const fields = [
            // Main
            { field: 'title', type: 'string', meta: { interface: 'input', width: 'full', note: 'Main Terminology Title' } },
            { field: 'description', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full', note: 'Main Description' } },

            // Aromaterapia Subsection (Grouping could be added via dividers, but fields first)
            { field: 'aromatherapy_divider', type: 'alias', meta: { interface: 'presentation-divider', options: { title: 'Aromaterapia' }, special: ['alias', 'no-data'] } },
            { field: 'aromatherapy_description', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
            { field: 'aromatherapy_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', width: 'half' } },

            // Hidroterapia Subsection
            { field: 'hydrotherapy_divider', type: 'alias', meta: { interface: 'presentation-divider', options: { title: 'Hidroterapia' }, special: ['alias', 'no-data'] } },
            { field: 'hydrotherapy_description', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
            { field: 'hydrotherapy_image', type: 'uuid', schema: { foreign_key_table: 'directus_files' }, meta: { interface: 'file-image', width: 'half' } },
            { field: 'hydrotherapy_effects_description', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full', note: 'Description of effects' } },
            { field: 'hydrotherapy_effects_bullets', type: 'json', meta: { interface: 'list', width: 'full', note: 'List of specific effects' } }
        ];

        for (const f of fields) {
            try {
                if (f.type === 'alias') {
                    await client.request(createField('terminology', f as any)); // divider
                    console.log(`Created divider ${f.field}`);
                } else {
                    // Check if exists logic omitted for simplicity, createField throws if exists usually, catch ignores
                    await client.request(createField('terminology', f as any));
                    console.log(`Created field ${f.field}`);
                }
            } catch (err: any) {
                if (err?.errors?.[0]?.extensions?.code === 'FIELD_DUPLICATE' || err?.message?.includes('Duplicate column name')) {
                    console.log(`Field ${f.field} already exists (or error ignored).`);
                } else {
                    console.error(`Error creating field ${f.field}:`, err);
                }
            }
        }

        console.log('Terminology setup complete.');

    } catch (error: any) {
        console.error('Error setting up terminology:', error);
        if (error?.errors) {
            console.error('Directus Errors:', JSON.stringify(error.errors, null, 2));
        }
    }
}

setupTerminology();
