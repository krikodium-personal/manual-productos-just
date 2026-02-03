
const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'admin@example.com';
const PASSWORD = 'password';

async function run() {
    // 1. Login
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const data = await res.json();
    const token = data.data.access_token;
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    // Helper to log errors
    const log = (msg, err) => console.log(msg, err.errors || err);

    // --- PART 1: Fix M2M Relations (Ingredients, Needs, Attributes, Usage Modes) ---
    const m2mConfigs = [
        { field: 'ingredients', related: 'ingredients', junction: 'products_ingredients', fk1: 'product_id', fk2: 'ingredient_id' },
        { field: 'needs', related: 'needs', junction: 'products_needs', fk1: 'product_id', fk2: 'need_id' },
        { field: 'attributes', related: 'attributes', junction: 'products_attributes', fk1: 'product_id', fk2: 'attribute_id' },
        { field: 'usage_modes', related: 'usage_modes', junction: 'products_usage_modes', fk1: 'product_id', fk2: 'usage_mode_id' }
    ];

    for (const cfg of m2mConfigs) {
        console.log(`\n=== REPAIRING ${cfg.field.toUpperCase()} ===`);

        // A. Clean slate: Delete connection field on Products
        await fetch(`${DIRECTUS_URL}/fields/products/${cfg.field}`, { method: 'DELETE', headers });
        // B. Clean slate: Delete junction collection entirely (cascade deletes relations)
        await fetch(`${DIRECTUS_URL}/collections/${cfg.junction}`, { method: 'DELETE', headers });

        console.log(`Deleted existing ${cfg.field} schema.`);

        // C. Create Junction Collection
        const junRes = await fetch(`${DIRECTUS_URL}/collections`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: cfg.junction,
                meta: { hidden: true },
                schema: {} // auto-add id
            })
        });
        if (!junRes.ok) log('Junction creation failed', await junRes.json());

        // D. Create FK Fields in Junction
        // Product ID (FK1)
        await fetch(`${DIRECTUS_URL}/fields/${cfg.junction}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ field: cfg.fk1, type: 'integer', meta: { hidden: true } })
        });
        // Related ID (FK2)
        await fetch(`${DIRECTUS_URL}/fields/${cfg.junction}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ field: cfg.fk2, type: 'integer', meta: { hidden: true } })
        });

        // E. Create Relations for Junction (Standard Setup)
        // Relation 1: Junction -> Product
        await fetch(`${DIRECTUS_URL}/relations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: cfg.junction,
                field: cfg.fk1,
                related_collection: 'products',
                schema: { onDelete: 'CASCADE' },
                meta: {
                    one_field: cfg.field, // CRITICAL: This links back to the alias on Products
                    junction_field: cfg.fk2
                }
            })
        });
        // Relation 2: Junction -> Related
        await fetch(`${DIRECTUS_URL}/relations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: cfg.junction,
                field: cfg.fk2,
                related_collection: cfg.related,
                schema: { onDelete: 'CASCADE' },
                meta: {
                    junction_field: cfg.fk1
                }
            })
        });

        // F. Create Alias Field on Products
        const aliasRes = await fetch(`${DIRECTUS_URL}/fields/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                field: cfg.field,
                type: 'alias',
                schema: null,
                meta: {
                    interface: 'list-m2m',
                    special: ['m2m'],
                    display: 'related-values',
                    display_options: { template: '{{name}}' }
                }
            })
        });
        if (aliasRes.ok) console.log('Alias recreated successfully.');
        else log('Alias creation failed', await aliasRes.json());
    }


    // --- PART 2: Fix Repeater Fields (Benefits, Uses, Precautions) ---
    console.log('\n=== FIXING REPEATERS ===');
    // We need to change these from 'text' (input) to 'json' (list)

    const repeaters = [
        {
            field: 'benefits',
            structure: [
                { field: 'benefit', name: 'Benefit Description', type: 'string', interface: 'input' }
            ]
        },
        {
            field: 'uses_suggestions',
            structure: [
                { field: 'description', name: 'Suggestion', type: 'text', interface: 'input-multiline' }
            ]
        },
        {
            field: 'specific_precautions',
            structure: [
                { field: 'precaution', name: 'Precaution', type: 'string', interface: 'input' }
            ]
        }
    ];

    for (const rep of repeaters) {
        console.log(`Fixing ${rep.field}...`);
        // Update field type to JSON and Interface to List
        await fetch(`${DIRECTUS_URL}/fields/products/${rep.field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                type: 'json',
                meta: {
                    interface: 'list',
                    special: null, // clear any specials
                    options: {
                        fields: rep.structure
                    }
                }
            })
        });
    }

    // --- PART 3: Fix Category Dropdown (Double Check) ---
    console.log('\n=== RE-CHECKING CATEGORY DROPDOWN ===');
    await fetch(`${DIRECTUS_URL}/fields/products/category`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            meta: {
                interface: 'select-dropdown-m2o',
                options: { template: '{{name}}' },
                display: 'related-values',
                display_options: { template: '{{name}}' }
            }
        })
    });

    console.log('Done. Please refresh Directus hard.');
}

run();
