import { createDirectus, rest, readFields, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function inspectIngredientsSchema() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Fetching fields for products_ingredients...");
        const fields = await client.request(readFields('products_ingredients'));

        console.log(fields.map(f => ({
            field: f.field,
            type: f.type,
            note: f.note
        })));

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectIngredientsSchema();
