
import { createDirectus, rest, readFields, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Reading fields for 'products'...");
        const fields = await client.request((readFields as any)('products')) as any[];

        // Filter out system fields (starting with date_, user_, id, sort, status) slightly
        const names = fields.map(f => f.field).sort();
        console.log("Fields in products:", names);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
