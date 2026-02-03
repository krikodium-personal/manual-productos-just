import { createDirectus, rest, createField, readItems, updateItem, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function setupIngredients() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        // 1. Create 'is_main' field in products_ingredients
        console.log("Creating 'is_main' field...");
        try {
            await client.request(createField('products_ingredients', {
                field: 'is_main',
                type: 'boolean',
                meta: {
                    interface: 'boolean',
                    options: {
                        label: 'Is Main Ingredient'
                    },
                    display: 'boolean',
                    width: 'half'
                },
                schema: {
                    default_value: false
                }
            }));
            console.log("Field 'is_main' created.");
        } catch (e: any) {
            console.log("Field creation skipped (might exist):", e.message);
        }

        // 2. Update a sample ingredient for Product 4 to be main
        // First, fetch ingredients for product 4
        console.log("Fetching ingredients for Product 4...");
        const relations = await client.request(readItems('products_ingredients', {
            filter: {
                product_id: 4
            }
        }));

        if (relations.length > 0) {
            // Set the first one as main for testing
            const targetId = relations[0].id;
            console.log(`Setting relation ID ${targetId} as main ingredient...`);
            await client.request(updateItem('products_ingredients', targetId, {
                is_main: true
            }));
            console.log("Updated sample ingredient.");
        } else {
            console.warn("No ingredients found for Product 4.");
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

setupIngredients();
