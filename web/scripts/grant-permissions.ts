
import { createDirectus, rest, createPermission, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Granting public read permission to 'products_products'...");

        await client.request(createPermission({
            role: null, // Public
            collection: 'products_products',
            action: 'read',
            permissions: {}, // Full read access
            fields: ['*'] // All fields
        }));

        console.log("Permission granted successfully.");

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
