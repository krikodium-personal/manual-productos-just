const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function refactorHierarchy() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 1. Create `product_market_prices`
        const pricesCollection = 'product_market_prices';
        console.log(`Creating collection ${pricesCollection}...`);

        await fetch(`${url}/collections`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: pricesCollection,
                schema: {},
                meta: {
                    translations: [{ language: 'es-ES', translation: 'Precios por Variante' }],
                    icon: 'price_check'
                }
            })
        });

        // 2. Add fields to `product_market_prices`
        // market_id (M2O -> product_markets)
        console.log('Adding market_id (parent link)...');
        await fetch(`${url}/fields/${pricesCollection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'market_id',
                type: 'integer',
                schema: { foreign_key_table: 'product_markets', foreign_key_column: 'id', on_delete: 'CASCADE' },
                meta: { interface: 'select-dropdown-m2o', special: ['m2o'], hidden: true } // Hidden in form usually if created from parent
            })
        });

        // variant_id (M2O -> variants) - Show "10 ml"
        console.log('Adding variant_id...');
        await fetch(`${url}/fields/${pricesCollection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'variant_id',
                type: 'integer',
                schema: { foreign_key_table: 'variants', foreign_key_column: 'id' },
                meta: {
                    interface: 'select-dropdown-m2o',
                    special: ['m2o'],
                    translations: [{ language: 'es-ES', translation: 'Variante' }],
                    display: 'related-values',
                    display_options: { template: '{{capacity_value}} {{capacity_unit}}' }
                }
            })
        });

        // price
        console.log('Adding price...');
        await fetch(`${url}/fields/${pricesCollection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'price',
                type: 'integer',
                meta: {
                    interface: 'input',
                    translations: [{ language: 'es-ES', translation: 'Precio' }]
                }
            })
        });

        // 3. Add O2M Alias to `product_markets`
        console.log('Adding prices O2M to product_markets...');
        await fetch(`${url}/fields/product_markets`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'prices',
                type: 'alias',
                meta: {
                    interface: 'list-o2m',
                    special: ['o2m'],
                    translations: [{ language: 'es-ES', translation: 'Lista de Precios' }]
                }
            })
        });

        // 4. Create Relation for O2M (product_markets.prices -> product_market_prices.market_id)
        console.log('Linking O2M relation...');
        await fetch(`${url}/relations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: pricesCollection,
                field: 'market_id',
                related_collection: 'product_markets',
                meta: {
                    one_field: 'prices',
                    sort_field: null,
                    one_collection_field: 'market_id',
                    one_allowed_collections: null,
                    junction_field: null
                }
            })
        });

        // 5. Cleanup: Remove the flat fields from `product_markets`
        console.log('Cleaning up old flat fields (variant_id, price) from product_markets...');
        await fetch(`${url}/fields/product_markets/variant_id`, { method: 'DELETE', headers });
        await fetch(`${url}/fields/product_markets/price`, { method: 'DELETE', headers });

        console.log('Hierarchy refactor complete.');

    } catch (error) {
        console.error('Error:', error);
    }
}

refactorHierarchy();
