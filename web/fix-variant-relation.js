const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function fixRelation() {
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

        const collection = 'product_market_prices';
        const field = 'variant_id';
        const relatedCollection = 'variants';

        console.log(`Checking/Creating relation for ${field} -> ${relatedCollection}...`);

        // Create relation in directus_relations
        const run = await fetch(`${url}/relations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: collection,
                field: field,
                related_collection: relatedCollection,
                schema: {
                    on_delete: 'SET NULL'
                    // Should be RESTRICT or SET NULL? Variants should persist often.
                },
                meta: {
                    one_field: null, // No O2M back-link needed
                    sort_field: null,
                    one_collection_field: null,
                    one_allowed_collections: null,
                    junction_field: null
                }
            })
        });

        if (run.ok) {
            console.log('✅ Relation created successfully.');
        } else {
            const err = await run.json();
            if (err.errors?.[0]?.code === 'RECORD_NOT_UNIQUE') {
                console.log('Relation already exists? Checking meta...');
                // Maybe update meta if exist
            } else {
                console.error('Error creating relation:', JSON.stringify(err, null, 2));
            }
        }

        // Also ensure display template on field meta
        console.log('Ensuring display template on field meta...');
        await fetch(`${url}/fields/${collection}/${field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    interface: 'select-dropdown-m2o',
                    options: {
                        template: '{{capacity_value}} {{capacity_unit}}'
                    },
                    display: 'related-values', // or related-values
                    display_options: {
                        template: '{{capacity_value}} {{capacity_unit}}'
                    }
                }
            })
        });
        console.log('Field meta updated.');

    } catch (error) {
        console.error('Error:', error);
    }
}

fixRelation();
