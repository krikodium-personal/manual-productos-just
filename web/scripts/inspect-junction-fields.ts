import { createDirectus, rest, readFields, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function inspectfields() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        const fields = await client.request(readFields('products_ingredients'));
        console.log("Fields in products_ingredients:");
        fields.forEach(f => console.log(`- ${f.field}`));

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectfields();
