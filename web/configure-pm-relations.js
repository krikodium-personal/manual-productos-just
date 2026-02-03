const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function configureRelations() {
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
        const field = 'variant_id';
        const relatedCollection = 'variants';

        console.log(`Creating relation for ${field} -> ${relatedCollection}...`);

        const response = await fetch(`${url}/relations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: collection,
                field: field,
                related_collection: relatedCollection,
                schema: {
                    on_delete: 'SET NULL' // or RESTRICT if we want integrity
                },
                meta: {
                    // Display template for the dropdown?
                    // We want to see "10 ml" in the dropdown?
                    // Directus uses display templates.
                }
            })
        });

        if (response.ok) {
            console.log(`✅ Relation created for ${field}.`);
        } else {
            const err = await response.json();
            if (err.errors?.[0]?.code === 'RECORD_NOT_UNIQUE') {
                console.log(`Relation for ${field} already exists (or conflict).`);
            } else {
                console.error(`❌ Failed to create relation:`, JSON.stringify(err, null, 2));
            }
        }

        // Also update the Display Template for easier selection
        // We want to see "10 ml" (capacity_value + capacity_unit)
        // But Directus display templates usually support single fields or mustache {{field}}.
        // Let's set it to {{capacity_value}} {{capacity_unit}} via 'fields' meta update?
        // Actually that's on the RELATION or the FIELD META.
        // The Display Template is on the RELATION meta if it's M2O? No, it's on the FIELD meta usually (interface options).
        // Or on the Related Collection's display template?
        // Let's set it on the field `variant_id` meta: `display_template: "{{capacity_value}} {{capacity_unit}}"`

        console.log('Updating display template...');
        await fetch(`${url}/fields/${collection}/${field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    display: 'related',
                    display_options: {
                        template: '{{capacity_value}} {{capacity_unit}}'
                    }
                }
            })
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

configureRelations();
