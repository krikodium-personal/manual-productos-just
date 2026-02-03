import { createDirectus, rest, authentication, createRelation, updateField } from '@directus/sdk';
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(authentication())
    .with(rest());

async function fixTerminologyFields() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Logged in as admin');

        // 1. Create file relationships
        // Without this, the interface doesn't know it's a relation to directus_files
        const imageFields = ['aromatherapy_image', 'hydrotherapy_image'];

        for (const field of imageFields) {
            try {
                console.log(`Creating relation for ${field}...`);
                await client.request(createRelation({
                    collection: 'terminology',
                    field: field,
                    related_collection: 'directus_files',
                    schema: {
                        on_delete: 'SET NULL'
                    },
                    meta: {
                        sort_field: null,
                        junction_field: null
                    }
                }));
                console.log(`Relation for ${field} created.`);
            } catch (err: any) {
                if (err?.errors?.[0]?.extensions?.code === 'RELATION_EXIST') {
                    console.log(`Relation for ${field} already exists.`);
                } else {
                    console.error(`Error creating relation for ${field}:`, err?.message || err);
                }
            }
        }

        // 2. Fix List field options
        // The list interface sometimes needs options to function nicely
        console.log('Updating hydrotherapy_effects_bullets options...');
        await client.request(updateField('terminology', 'hydrotherapy_effects_bullets', {
            meta: {
                interface: 'list',
                options: {
                    addLabel: 'Agregar efecto',
                    removeLabel: 'Eliminar',
                    placeholder: 'Escribe un efecto...'
                }
            }
        }));
        console.log('List field updated.');

    } catch (error: any) {
        console.error('Error fixing fields:', error);
        if (error?.errors) {
            console.error('Directus Errors:', JSON.stringify(error.errors, null, 2));
        }
    }
}

fixTerminologyFields();
