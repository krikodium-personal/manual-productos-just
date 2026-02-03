
import { createDirectus, rest, createField, authentication } from '@directus/sdk';
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

    console.log('Adding UI Aliases...');

    // 1. Add 'markets' alias to 'products'
    // This allows editing Product Markets directly inside the Product form
    try {
        console.log("Creating 'markets' alias on products...");
        await client.request(createField('products', {
            field: 'markets',
            type: 'alias',
            schema: undefined, // Virtual field
            meta: {
                interface: 'list-o2m',
                special: ['o2m'],
                display: 'related-values',
                display_options: {
                    template: '{{country_id.name}}' // Show Country Name in list
                },
                options: {
                    enableSelect: false, // Don't select existing, only create new for this context usually
                    enableCreate: true
                }
            }
        }));
        console.log('Success: products.markets');
    } catch (e: any) {
        if (e.errors?.[0]?.extensions?.code === 'INVALID_PAYLOAD') {
            // Maybe schema should be null or undefined, SDK sometimes tricky with null.
            // But usually schema: null is correct for alias.
            console.log('Error creating products.markets:', e.message, JSON.stringify(e.errors));
        } else {
            console.log('Error creating products.markets:', e.message);
        }
    }

    // 2. Add 'variants' alias to 'product_markets'
    // This allows editing Variants directly inside the Market item (inside the Product form)
    try {
        console.log("Creating 'variants' alias on product_markets...");
        await client.request(createField('product_markets', {
            field: 'variants',
            type: 'alias',
            schema: undefined,
            meta: {
                interface: 'list-o2m',
                special: ['o2m'],
                display: 'related-values',
                display_options: {
                    template: '{{capacity_value}}{{capacity_unit}} - ${{price}}'
                }
            }
        }));
        console.log('Success: product_markets.variants');
    } catch (e: any) {
        console.log('Error creating product_markets.variants:', e.message);
    }

    console.log('Done.');
}

main().catch(console.error);
