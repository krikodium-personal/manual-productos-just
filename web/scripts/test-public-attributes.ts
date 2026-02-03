import { createDirectus, rest, readItem } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(rest()); // No auth = Public

async function testPublicAttributes() {
    try {
        console.log("Fetching Product 4 attributes (Public)...");
        const result = await client.request(readItem('products', 4, {
            fields: [
                'id',
                'attributes.attribute_id.*'
            ]
        }));

        console.log(JSON.stringify(result, null, 2));

    } catch (e: any) {
        console.error('Error:', e.message);
        // Directus SDK might throw if forbidden field
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

testPublicAttributes();
