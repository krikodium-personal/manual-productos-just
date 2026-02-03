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
        console.log('Logged in as admin');

        console.log("Creating 'slug' field in 'ingredients'...");
        try {
            await client.request(createField('ingredients', {
                field: 'slug',
                type: 'string',
                meta: {
                    interface: 'input-slug', // Directus built-in slug interface
                    options: {
                        template: '{{name}}', // Auto-generate from name
                        slugify: true
                    },
                    display: 'raw',
                    readonly: false,
                    hidden: false,
                    width: 'half'
                },
                schema: {
                    is_unique: true
                }
            }));
            console.log("Field 'slug' created successfully.");
        } catch (err: any) {
            if (err?.errors?.[0]?.extensions?.code === 'INVALID_PAYLOAD' && err?.message?.includes('already exists')) {
                console.log("Field 'slug' already exists.");
            } else {
                console.error("Error creating field:", err);
            }
        }

    } catch (error: any) {
        console.error('Error:', error);
    }
}

main();
