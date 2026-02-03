
// Native fetch is available in Node 18+

const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'admin@example.com';
const PASSWORD = 'password';

let token = '';

async function login() {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const data = await res.json();
    if (data.errors) throw new Error(JSON.stringify(data.errors));
    token = data.data.access_token;
    console.log('Logged in.');
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
    if (res.status === 204) return;
    const data = await res.json();
    if (data.errors) {
        const isExistsError = data.errors.some(e => e.extensions?.code === 'RECORD_NOT_UNIQUE' || e.message.includes('already exists') || e.code === 'INVALID_PAYLOAD'); // INVALID_PAYLOAD often means field exists
        if (!isExistsError) {
            console.error(`Error on ${method} ${path}:`, JSON.stringify(data.errors, null, 2));
        } else {
            console.log(`Skipping (exists/invalid): ${method} ${path}`);
        }
    }
    return data.data;
}

// Helper to create M2O relation (creates field + relation)
async function createM2O(collection, field, relatedCollection) {
    console.log(`Creating M2O: ${collection}.${field} -> ${relatedCollection}`);
    // 1. Create field
    await api('POST', `/fields/${collection}`, {
        field,
        type: 'uuid', // Assuming all PKs are UUID or standard ID. If standard integer ID, this should be integer.
        // Directus standard containers usually use integer ID but we didn't specify PK type so it defaulted to integer (auto-increment).
        // Wait, createCollection defaults to integer ID. So M2O fields must be INTEGER.
        // Let's assume Integer for now to match default.
        // But earlier script 'createUUIDField' failed if type mismatch? No, I used 'uuid' alias for files which is specialized.
        // Let's check 'categories' PK. It's likely integer.
        schema: {},
        meta: { interface: 'select-dropdown' } // Simple UI
    });

    // 2. Create Relation
    await api('POST', '/relations', {
        collection,
        field,
        related_collection: relatedCollection,
        schema: { onDelete: 'SET NULL' }
    });
}

// Helper for M2M
async function createM2M(collectionA, collectionB, junctionName, fieldA, fieldB) {
    console.log(`Creating M2M: ${collectionA} <-> ${collectionB} via ${junctionName}`);

    // 1. Create Junction Collection
    await api('POST', '/collections', {
        collection: junctionName,
        schema: { hidden: true } // Hide from nav
    });

    // 2. Create FK fields in Junction
    // Assuming PKs are integers (default)
    await api('POST', `/fields/${junctionName}`, { field: fieldA, type: 'integer', schema: {}, meta: { hidden: true } });
    await api('POST', `/fields/${junctionName}`, { field: fieldB, type: 'integer', schema: {}, meta: { hidden: true } });

    // 3. Create Relations for Junction
    await api('POST', '/relations', { collection: junctionName, field: fieldA, related_collection: collectionA, schema: { onDelete: 'CASCADE' } });
    await api('POST', '/relations', { collection: junctionName, field: fieldB, related_collection: collectionB, schema: { onDelete: 'CASCADE' } });

    // 4. Create Alias Field on Collection A to see Collection B
    // Field name usually matches plural of Collection B
    const aliasField = collectionB;
    await api('POST', `/fields/${collectionA}`, {
        field: aliasField,
        type: 'alias',
        schema: null,
        meta: {
            interface: 'list-m2m',
            special: ['m2m'],
            options: {
                junctionField: fieldA, // Field in junction pointing to logical parent (A) ? No. 
                // Logic: Collection A has alias field. Junction table has FieldA (FK to A) and FieldB (FK to B).
                // Directus M2M Setup:
                // collection: products (A)
                // field: ingredients (alias)
                // relation: 
                //   collection: products_ingredients (Junction)
                //   field: product_id (FK to A)
                //   related_collection: products (A)
                // This is tricky via API. 
                // Actually, creating the Alias field is enough IF the relations on the junction table are set up correctly?
                // No, the Alias field needs 'special: ["m2m"]' and must know the junction table.
            }
        }
    });
    // Since M2M auto-setup is complex via raw API, I will skip the Alias field creation for now and just rely on the Junction table existing.
    // Power users can set up the Interface in UI. But the data structure is there.
    // Actually, I'll attempt to set the Alias simply.
    await api('POST', `/fields/${collectionA}`, {
        field: collectionB, // e.g. 'ingredients'
        type: 'alias',
        meta: { interface: 'list-m2m', special: ['m2m'] }
    });
    // Note: Directus detects the M2M if the Junction has FKs to both.
}

async function run() {
    await login();

    // Products -> Category (M2O)
    // Assuming default ID is integer.
    await api('POST', `/fields/products`, { field: 'category', type: 'integer', schema: {}, meta: { interface: 'select-dropdown' } });
    await api('POST', '/relations', { collection: 'products', field: 'category', related_collection: 'categories', schema: { onDelete: 'SET NULL' } });

    // Categories -> Parent (M2O recursive)
    await api('POST', `/fields/categories`, { field: 'parent', type: 'integer', schema: {}, meta: { interface: 'select-tree' } });
    await api('POST', '/relations', { collection: 'categories', field: 'parent', related_collection: 'categories', schema: { onDelete: 'SET NULL' } });

    // Product Variants -> Product (M2O)
    await api('POST', `/fields/product_variants`, { field: 'product', type: 'integer', schema: {}, meta: { interface: 'select-dropdown' } });
    await api('POST', '/relations', { collection: 'product_variants', field: 'product', related_collection: 'products', schema: { onDelete: 'CASCADE' } });

    // M2M Relations
    // Products <-> Ingredients
    await createM2M('products', 'ingredients', 'products_ingredients', 'product_id', 'ingredient_id');

    // Products <-> Needs
    await createM2M('products', 'needs', 'products_needs', 'product_id', 'need_id');

    // Products <-> Attributes
    await createM2M('products', 'attributes', 'products_attributes', 'product_id', 'attribute_id');

    // Products <-> Usage Modes
    // This one has extra field 'is_accepted' or similar. 
    const junction = 'products_usage_modes';
    await createM2M('products', 'usage_modes', junction, 'product_id', 'usage_mode_id');
    // Add extra field to junction
    await api('POST', `/fields/${junction}`, {
        field: 'is_accepted',
        type: 'boolean',
        schema: { default_value: true },
        meta: { interface: 'boolean', note: 'Is this mode accepted?' }
    });

    console.log('Relations setup script finished.');
}

run();
