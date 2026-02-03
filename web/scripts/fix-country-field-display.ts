
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

    console.log('Fixing Country Field Display...');

    // Fix 'product_markets.country_id'
    // We want a Dropdown that shows "Argentina", not "1".
    try {
        console.log("Updating product_markets.country_id...");
        await client.request(updateField('product_markets', 'country_id', {
            meta: {
                interface: 'select-dropdown-m2o', // Specific interface for M2O dropdown
                options: {
                    template: '{{name}}', // What to show in the dropdown list
                },
                display: 'related-values', // How to show it when selected/read-only
                display_options: {
                    template: '{{name}}' // What to show in the display
                }
            }
        }));
        console.log("Success: product_markets.country_id");
    } catch (e: any) {
        console.log("Error product_markets.country_id:", e.message);
    }

    console.log('Done.');
}

main().catch(console.error);
