
import { createDirectus, rest, readRelations, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Reading relations for 'products'...");
        const relations = await client.request(readRelations());

        const relevant = relations.filter((r: any) => r.collection === 'products' && r.field === 'related_products');
        // Actually, the relation for M2M alias is defined on the Junction table, pointing TO products.
        // But let's look for anything involving 'products'

        // Find relation where One side is 'products' and field is 'related_products' (Note: M2M alias doesn't always show up as relation object directly if inferred? No, it should be there)
        // Wait, for M2M, there are two relations. 
        // 1. products.related_products -> junction
        // No, usually defined as O2M from products to Junction, then M2O from Junction to other.

        console.log("Filtering relations...");
        const productRelations = relations.filter(r =>
            (r.collection === 'products') ||
            (r.related_collection === 'products')
        );

        console.log(JSON.stringify(productRelations, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
