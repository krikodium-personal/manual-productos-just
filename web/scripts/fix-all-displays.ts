
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

    console.log('Fixing Display Options...');

    // 1. Fix 'products.markets' (The list of countries in the Product form)
    // We want to see the Country Name.
    // The items in this list are 'product_markets' rows.
    // Use the relational field country_id.
    try {
        console.log("Updating products.markets...");
        await client.request(updateField('products', 'markets', {
            meta: {
                display: 'related-values',
                display_options: {
                    template: '{{country_id.name}}', // Dig deeper into the relation
                }
            }
        }));
        console.log("Success: products.markets");
    } catch (e: any) {
        console.log("Error products.markets:", e.message);
    }

    // 2. Fix 'product_markets.variants' (The list of variants inside a Market form)
    // We want to see "10ml - $10000"
    // The items are 'market_variants' rows.
    try {
        console.log("Updating product_markets.variants...");
        await client.request(updateField('product_markets', 'variants', {
            meta: {
                display: 'related-values',
                display_options: {
                    template: '{{capacity_value}}{{capacity_unit}} - ${{price}}'
                }
            }
        }));
        console.log("Success: product_markets.variants");
    } catch (e: any) {
        console.log("Error product_markets.variants:", e.message);
    }

    // 3. Just in case, update 'product_markets' collection display template (if viewed directly)
    // Not strictly necessary for O2M field but good practice.
    // Updating collection meta is harder via SDK 'updateField', skipping for now as fields are what matters for the form.

    console.log('Done.');
}

main().catch(console.error);
