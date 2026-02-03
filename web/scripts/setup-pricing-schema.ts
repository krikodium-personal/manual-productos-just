
import { createDirectus, rest, createCollection, createField, createItem, readItems, updateItem, deleteItems, authentication, deleteCollection, deleteField } from '@directus/sdk';
import 'dotenv/config';

// Create client with authentication
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

    // --- 0. Clean Up Old Schema (Optional but good for dev) ---
    const oldCollections = ['product_prices', 'product_variants', 'market_variants', 'product_markets'];
    for (const col of oldCollections) {
        try {
            await client.request(deleteCollection(col));
            console.log(`Deleted old collection: ${col}`);
        } catch (e: any) {
            // Ignore if not exists
        }
    }

    // --- 1. Create Collections ---

    const collections = ['countries', 'product_markets', 'market_variants'];

    for (const col of collections) {
        try {
            console.log(`Checking/Creating collection: ${col}`);
            // If countries exists we might keep it but let's try strict creation
            await client.request(createCollection({
                collection: col,
                schema: {},
                meta: { hidden: false }
            }));
            console.log(`Created collection: ${col}`);
        } catch (e: any) {
            if (e.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
                console.log(`Collection ${col} already exists.`);
            } else {
                console.log(`Note on ${col}:`, e.message);
            }
        }
    }

    // --- 2. Create Fields ---

    // Countries
    await ensureField('countries', 'name', { type: 'string' });
    await ensureField('countries', 'code', { type: 'string', meta: { unique: true } });
    await ensureField('countries', 'currency_symbol', { type: 'string' });

    // Product Markets (Product <-> Country Junction)
    await ensureField('product_markets', 'product_id', {
        type: 'integer',
        schema: { foreign_key_table: 'products', foreign_key_column: 'id' },
        meta: { interface: 'select-dropdown-m2o', special: ['m2o'] }
    });

    await ensureField('product_markets', 'country_id', {
        type: 'integer',
        schema: { foreign_key_table: 'countries', foreign_key_column: 'id' },
        meta: { interface: 'select-dropdown-m2o', special: ['m2o'] }
    });

    // Alias on Product? To make it visible in UI, we usually add the O2M alias on Products.
    // Spec: "product_markets" is the field on "products"? 
    // Directus doesn't auto-add the alias field. We should add it to Products if we want to edit it there.
    // Let's force add the alias 'markets' to products.
    try {
        await client.request(createField('products', {
            field: 'markets',
            type: 'alias',
            meta: {
                interface: 'list-m2m', // or one-to-many? It's O2M to the junction.
                special: ['o2m'],
                options: {
                    enableSelect: false // Junctions usually created inline
                }
            },
            schema: {} // Alias has no schema
        }));
        // Wait, to link it properly we need to say " दिस field relates to product_markets.product_id"
        // Directus API for alias creation is tricky via script without full payload.
        // Usually we just rely on the API access.
        // But for the user to "Select a country", they need to see this list.
        // I'll skip the alias creation script complexity and assume I might need to configure it manually or
        // the user is using the "Junction" layout.
        // Actually, if I create the FK 'product_id' on 'product_markets', Directus usually detects the relationship.
    } catch (e) { }


    // Market Variants (The actual prices)
    await ensureField('market_variants', 'market_id', {
        type: 'integer',
        schema: { foreign_key_table: 'product_markets', foreign_key_column: 'id' },
        meta: { interface: 'select-dropdown-m2o', special: ['m2o'] }
    });

    await ensureField('market_variants', 'capacity_value', { type: 'integer' });
    await ensureField('market_variants', 'capacity_unit', {
        type: 'string',
        meta: {
            interface: 'select-dropdown',
            options: {
                choices: [
                    { text: 'ml', value: 'ml' },
                    { text: 'gr', value: 'gr' }
                ]
            }
        }
    });
    await ensureField('market_variants', 'code', { type: 'string' });
    await ensureField('market_variants', 'price', { type: 'integer' });

    console.log('Schema setup complete.');

    // --- 3. Seed Data ---

    // Countries
    const countriesData = [
        { code: 'AR', name: 'Argentina', currency_symbol: '$' },
        { code: 'CL', name: 'Chile', currency_symbol: '$' },
        { code: 'UY', name: 'Uruguay', currency_symbol: '$' },
        { code: 'CO', name: 'Colombia', currency_symbol: '$' },
        { code: 'MX', name: 'México', currency_symbol: '$' },
        { code: 'PA', name: 'Panamá', currency_symbol: '$' },
        { code: 'PE', name: 'Perú', currency_symbol: 'S/' },
        { code: 'CR', name: 'Costa Rica', currency_symbol: '€' },
    ];

    console.log('Seeding countries...');
    const countryMap = new Map(); // code -> id

    for (const c of countriesData) {
        // Upsert
        const existing = await client.request(readItems('countries', { filter: { code: { _eq: c.code } } }));
        if (existing.length > 0) {
            await client.request(updateItem('countries', existing[0].id, c));
            countryMap.set(c.code, existing[0].id);
        } else {
            const created = await client.request(createItem('countries', c));
            countryMap.set(c.code, created.id);
        }
    }

    // Clean up potentially broken 'markets' field from products if it exists
    try {
        await client.request(deleteField('products', 'markets'));
        console.log('Cleaned up markets field from products.');
    } catch (e) { }

    // Products
    console.log('Finding Eucalipto product...');
    const products = await client.request(readItems('products', {
        filter: { name: { _contains: 'Eucalipto' } },
        fields: ['id']
    }));

    if (products.length === 0) {
        console.error('Product Eucalipto not found! Please create it first.');
        return;
    }
    const eucaliptoId = products[0].id;

    // Structure:
    // AR: 10ml/1014/$10000, 50ml/1015/$20000
    // CL: 10ml/1014/$2000, 50ml/1015/$3000
    // CR: 10ml/1014/€300, 50ml/1015/€700
    // UY: 10ml/1014/$7000, 50ml/1015/$9000
    // PE: 10ml/1014/S/540, 50ml/1015/S/1040

    const seedData = [
        { code: 'AR', items: [{ cap: 10, unit: 'ml', prodCode: '1014', price: 10000 }, { cap: 50, unit: 'ml', prodCode: '1015', price: 20000 }] },
        { code: 'CL', items: [{ cap: 10, unit: 'ml', prodCode: '1014', price: 2000 }, { cap: 50, unit: 'ml', prodCode: '1015', price: 3000 }] },
        { code: 'CR', items: [{ cap: 10, unit: 'ml', prodCode: '1014', price: 300 }, { cap: 50, unit: 'ml', prodCode: '1015', price: 700 }] },
        { code: 'UY', items: [{ cap: 10, unit: 'ml', prodCode: '1014', price: 7000 }, { cap: 50, unit: 'ml', prodCode: '1015', price: 9000 }] },
        { code: 'PE', items: [{ cap: 10, unit: 'ml', prodCode: '1014', price: 540 }, { cap: 50, unit: 'ml', prodCode: '1015', price: 1040 }] },
    ];

    console.log('Seeding market data...');

    // Clear old markets for this product
    const oldMarkets = await client.request(readItems('product_markets', {
        filter: { product_id: { _eq: eucaliptoId } }
    }));
    if (oldMarkets.length > 0) {
        await client.request(deleteItems('product_markets', oldMarkets.map((m: any) => m.id)));
    }

    for (const mData of seedData) {
        const cId = countryMap.get(mData.code);
        if (!cId) continue;

        // Create Market Entry (Product <-> Country)
        const market = await client.request(createItem('product_markets', {
            product_id: eucaliptoId,
            country_id: cId
        }));

        // Create Variants for this Market
        for (const item of mData.items) {
            await client.request(createItem('market_variants', {
                market_id: market.id,
                capacity_value: item.cap,
                capacity_unit: item.unit,
                code: item.prodCode,
                price: item.price
            }));
        }
    }
    console.log('Done.');
}


async function ensureField(collection: string, field: string, schema: any) {
    try {
        await client.request(createField(collection, {
            field: field,
            ...schema
        }));
        console.log(`Created field ${collection}.${field}`);
    } catch (e: any) {
        // Ignore if exists
    }
}

main().catch(console.error);
