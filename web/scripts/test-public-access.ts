import { createDirectus, rest, readItem } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(rest()); // No auth = Public

async function test() {
    try {
        // Use an ID that exists. I saw ID '3' in screenshots/logs or I can list first.
        // Let's try to list one item first.
        console.log("Fetching item...");
        // Fetch ID 1 or a known ID. 
        // Previously I saw "Aceite Esencial de Bergamota" (1021). I'll just fetch a single item.
        // readItem('products', 1) might fail if ID 1 doesn't exist.
        // I'll use readItems and limit 1.

        // Wait, I can't easily readItems if I don't know the query. 
        // I'll try to fetch product with ID 1, assuming it exists. Or check inspect logs.
        // In Step 2912, ID was '5' in user request, or maybe I should check `test-related-fetch.ts`

        // Actually, let's use `readItems` on `products` with limit 1.
        const result = await fetch('http://localhost:8055/items/products?limit=1&fields=id,tradition_title,tradition_text').then(r => r.json());

        console.log("Result:", JSON.stringify(result, null, 2));

        if (result.data && result.data.length > 0) {
            const item = result.data[0];
            if (item.tradition_title !== undefined) {
                console.log("SUCCESS: tradition_title is visible!");
            } else {
                console.log("FAILURE: tradition_title is missing from response.");
            }
        } else {
            console.log("No items found or error.");
        }

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

test();
