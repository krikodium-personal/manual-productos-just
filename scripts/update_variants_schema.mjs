
// CONFIGURATION
const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-4078.up.railway.app';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'password';

let token = '';

async function login() {
    console.log('Logging in...');
    try {
        const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
        });
        const data = await res.json();
        if (data.errors) throw new Error(JSON.stringify(data.errors));
        token = data.data.access_token;
        console.log('Logged in successfully.');
    } catch (e) {
        console.error('Login failed:', e);
        process.exit(1);
    }
}

async function api(method, path, body) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204) return { success: true };
    const data = await res.json();
    if (data.errors) return { success: false, errors: data.errors };
    return { success: true, data: data.data };
}

async function run() {
    await login();

    console.log('\n--- 1. "variants" Master Collection ---');
    await api('POST', '/collections', {
        collection: 'variants',
        schema: {},
        meta: { note: 'Catalog of variant types', icon: 'style' },
    });
    await api('POST', '/fields/variants', { field: 'name', type: 'string' });
    await api('POST', '/fields/variants', { field: 'capacity_value', type: 'integer' });
    await api('POST', '/fields/variants', { field: 'capacity_unit', type: 'string' });

    console.log('\n--- 2. "product_variant_prices" Collection ---');
    await api('POST', '/collections', {
        collection: 'product_variant_prices',
        schema: {},
        meta: {
            note: 'Prices per country',
            icon: 'attach_money',
            hidden: true,
            display_template: '{{market.name}} $ {{price}}' // Updated template
        },
    });

    // market -> Country ID (Force recreation as M2O)
    console.log('Cleaning and Recreating Market as M2O to countries...');
    await api('DELETE', '/relations/product_variant_prices/market');
    await api('DELETE', '/fields/product_variant_prices/market');

    await api('POST', '/fields/product_variant_prices', { field: 'market', type: 'integer' });
    await api('PATCH', '/fields/product_variant_prices/market', {
        meta: {
            label: 'Country ID',
            interface: 'select-dropdown-m2o',
            options: {
                template: '{{name}}'
            },
            display: 'related-values',
            display_options: {
                template: '{{name}}'
            }
        }
    });

    // Ensure relation exists for Market -> Countries
    await api('POST', '/relations', {
        collection: 'product_variant_prices',
        field: 'market',
        related_collection: 'countries',
        schema: { onDelete: 'RESTRICT' }
    });

    // Price as FLOAT with 2 decimals display
    await api('POST', '/fields/product_variant_prices', { field: 'price', type: 'float' });
    await api('PATCH', '/fields/product_variant_prices/price', {
        schema: {
            numeric_precision: 10,
            numeric_scale: 2
        },
        meta: {
            label: 'Precio',
            interface: 'input-number',
            options: { step: 0.01 },
            display: 'number',
            display_options: {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        }
    });

    await api('POST', '/fields/product_variant_prices', { field: 'product_variant', type: 'integer' });

    await api('POST', '/relations', {
        collection: 'product_variant_prices',
        field: 'product_variant',
        related_collection: 'product_variants',
        schema: { onDelete: 'CASCADE' },
        meta: { one_field: 'prices' }
    });

    console.log('\n--- 3. "products" Collection ---');
    await api('POST', '/fields/products', { field: 'variants', type: 'alias' });
    await api('PATCH', '/fields/products/variants', {
        meta: {
            label: 'Variantes de Productos',
            interface: 'list-o2m',
            special: ['o2m'],
            sort: 50,
            options: {
                fields: ['variant_id', 'code'],
                enableCreate: true,
                enableSelect: false
            },
            display: 'related-values',
            display_options: {
                template: '{{variant_id.capacity_value}} {{variant_id.capacity_unit}} - {{code}}'
            },
            hidden: false
        }
    });

    console.log('\n--- 4. "product_variants" Collection ---');
    await api('PATCH', '/collections/product_variants', { meta: { hidden: true } });

    await api('POST', '/fields/product_variants', { field: 'variant_id', type: 'integer' });
    await api('PATCH', '/fields/product_variants/variant_id', {
        meta: {
            label: 'Variant ID',
            interface: 'select-dropdown-m2o',
            required: true,
            display: 'related-values',
            display_options: { template: '{{capacity_value}} {{capacity_unit}}' },
            options: { template: '{{capacity_value}} {{capacity_unit}}' }
        }
    });
    await api('POST', '/relations', {
        collection: 'product_variants',
        field: 'variant_id',
        related_collection: 'variants',
        schema: { onDelete: 'RESTRICT' }
    });

    await api('POST', '/fields/product_variants', { field: 'product_id', type: 'integer' });
    await api('POST', '/relations', {
        collection: 'product_variants',
        field: 'product_id',
        related_collection: 'products',
        schema: { onDelete: 'CASCADE' },
        meta: { one_field: 'variants' }
    });

    await api('POST', '/fields/product_variants', { field: 'prices', type: 'alias' });
    await api('PATCH', '/fields/product_variants/prices', {
        meta: {
            label: 'Mercados y precios',
            interface: 'list-o2m',
            special: ['o2m'],
            options: {
                fields: ['market', 'price'],
                enableCreate: true,
                enableSelect: false
            },
            display: 'related-values',
            display_options: {
                template: '{{market.name}} $ {{price}}' // Updated template for M2O
            },
            hidden: false
        }
    });

    console.log('\nDone. Schema update finished.');
}

run();
