const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function updateProductMarkets() {
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

        const collection = 'product_markets';

        // 1. Add `variant_id` (M2O -> variants)
        console.log(`Adding variant_id to ${collection}...`);

        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'variant_id',
                type: 'integer', // or uuid? variants check: created with auto-increment ID? Usually yes if not specified.
                // Let's assume integer PK for variants.
                schema: {
                    foreign_key_table: 'variants',
                    foreign_key_column: 'id'
                    // is_nullable: false? Maybe true for migration.
                },
                meta: {
                    interface: 'select-dropdown-m2o', // or simple m2o
                    special: ['m2o'],
                    translations: [{ language: 'es-ES', translation: 'Variante' }]
                }
            })
            // Directus SDK usually handles field creates.
        });

        // 2. Add `price`
        console.log(`Adding price to ${collection}...`);
        await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: 'price',
                type: 'integer', // or float? User said price. Integer is safer for currency usually, or decimal.
                // Let's use 'decimal' or 'float' if supported, or 'integer'. 
                // Directus 'decimal' is good.
                schema: {
                    numeric_precision: 10,
                    numeric_scale: 2
                },
                meta: {
                    interface: 'input',
                    translations: [{ language: 'es-ES', translation: 'Precio' }]
                }
            })
        });

        console.log('Fields added.');

    } catch (error) {
        console.error('Error:', error);
    }
}

updateProductMarkets();
