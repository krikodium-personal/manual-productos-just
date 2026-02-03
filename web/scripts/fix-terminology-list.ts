import { createDirectus, rest, authentication, updateField } from '@directus/sdk';
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(authentication())
    .with(rest());

async function fixTerminologyList() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Logged in as admin');

        // Configure Repeater fields
        console.log('Updating hydrotherapy_effects_bullets with Repeater fields...');
        await client.request(updateField('terminology', 'hydrotherapy_effects_bullets', {
            meta: {
                interface: 'list', // Repeater interface
                special: ['cast-json'], // Ensure it's treated as JSON
                options: {
                    addLabel: 'Agregar efecto',
                    template: '{{effect}}', // Display the value in the list row
                    fields: [
                        {
                            field: 'effect',
                            name: 'Efecto',
                            type: 'string',
                            meta: {
                                interface: 'input',
                                width: 'full',
                                required: true
                            }
                        }
                    ]
                }
            }
        }));
        console.log('List field configured with internal fields.');

    } catch (error: any) {
        console.error('Error fixing list:', error);
        if (error?.errors) {
            console.error('Directus Errors:', JSON.stringify(error.errors, null, 2));
        }
    }
}

fixTerminologyList();
