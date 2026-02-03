
import { createDirectus, rest, deleteField, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    console.log('Authenticating...');
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Authenticated.');
    } catch (error) {
        console.error('Authentication failed:', error);
        return;
    }

    console.log('Cleaning up deprecated fields from "products"...');

    // 1. Delete 'capacity'
    try {
        console.log("Deleting 'capacity' field...");
        await client.request(deleteField('products', 'capacity'));
        console.log("Success: Deleted 'capacity'.");
    } catch (e: any) {
        // 403 or 404 might happen if already gone
        console.log("Note on 'capacity':", e.message);
    }

    // 2. Delete 'prices'
    try {
        console.log("Deleting 'prices' field...");
        await client.request(deleteField('products', 'prices'));
        console.log("Success: Deleted 'prices'.");
    } catch (e: any) {
        console.log("Note on 'prices':", e.message);
    }

    console.log('Cleanup complete.');
}

main().catch(console.error);
