import { createDirectus, rest, readFields, readItems, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function inspectProductSlugs() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        // 1. Check if 'slug' field exists
        const fields = await client.request(readFields('products'));
        const hasSlug = fields.some(f => f.field === 'slug');
        console.log(`Has 'slug' field: ${hasSlug}`);

        // 2. Check content of products
        const products = await client.request(readItems('products', {
            fields: ['id', 'name', hasSlug ? 'slug' : 'id']
        }));
        console.log("Product samples:", JSON.stringify(products, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectProductSlugs();
