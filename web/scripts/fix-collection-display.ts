
import { createDirectus, rest, updateCollection, authentication } from '@directus/sdk';
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

    console.log('Fixing Collection Display Templates...');

    // 1. Fix 'product_markets' Collection Display
    // When listed, it should show the country name.
    try {
        console.log("Updating collection product_markets...");
        await client.request(updateCollection('product_markets', {
            meta: {
                display_template: '{{country_id.name}}'
            }
        }));
        console.log("Success: product_markets display_template");
    } catch (e: any) {
        console.log("Error product_markets:", e.message);
    }

    // 2. Fix 'market_variants' Collection Display
    // When listed, it should show capacity and price.
    try {
        console.log("Updating collection market_variants...");
        await client.request(updateCollection('market_variants', {
            meta: {
                display_template: '{{capacity_value}}{{capacity_unit}} - ${{price}}'
            }
        }));
        console.log("Success: market_variants display_template");
    } catch (e: any) {
        console.log("Error market_variants:", e.message);
    }

    console.log('Done.');
}

main().catch(console.error);
