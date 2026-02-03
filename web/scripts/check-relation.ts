import { createDirectus, rest, readRelations, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function checkRel() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Checking relations for products.tradition_image...");
        const relations = await client.request((readRelations as any)({
            filter: {
                collection: { _eq: 'products' },
                field: { _eq: 'tradition_image' }
            }
        }));

        console.log(JSON.stringify(relations, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkRel();
