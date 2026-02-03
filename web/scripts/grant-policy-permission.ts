
import { createDirectus, rest, createPermission, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'; // From previous step

        console.log(`Granting read permission to 'products_products' for Policy ${publicPolicyId}...`);

        await client.request(createPermission({
            policy: publicPolicyId,
            collection: 'products_products',
            action: 'read',
            permissions: {},
            fields: ['*']
        }));

        console.log("Permission granted successfully to Public Policy.");

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
