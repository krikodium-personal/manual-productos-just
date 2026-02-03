
import { createDirectus, rest, updateField, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    console.log('Authenticating...');
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Authenticated.');
    } catch (error) {
        console.error('Authentication failed:', error);
        return;
    }

    console.log('Configuring Markets Interface Template...');

    // The 'list-o2m' interface uses the 'template' option to determine what to show in the list items.
    // This is distinct from 'display_options.template' which is for read-only mode.
    try {
        await client.request(updateField('products', 'markets', {
            meta: {
                interface: 'list-o2m',
                special: ['o2m'],
                options: {
                    enableSelect: false,
                    enableCreate: true,
                    // THIS IS THE KEY: The template for the list items in the form
                    template: '{{country_id.name}}',
                    fields: ['country_id.name'] // Ensure this field is fetched
                }
            }
        }));
        console.log("Success: Updated products.markets interface options.");
    } catch (e: any) {
        console.log("Error updating products.markets:", e.message);
    }

    console.log('Done.');
}

main().catch(console.error);
