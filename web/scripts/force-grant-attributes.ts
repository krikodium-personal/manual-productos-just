import { createDirectus, rest, createPermission, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function forceGrant() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'; // From inspection
        const collections = ['attributes', 'products_attributes'];

        for (const col of collections) {
            console.log(`Attempting to create public read permission for ${col} (Policy: ${publicPolicyId})...`);
            try {
                // @ts-ignore - SDK might not have strict types for policy id yet if old version
                await client.request(createPermission({
                    policy: publicPolicyId,
                    collection: col,
                    action: 'read',
                    fields: ['*']
                }));
                console.log(`Success: Permission created for ${col}`);
            } catch (e: any) {
                console.log(`Failed to create for ${col}:`, e.message);
                if (e.errors) console.log(JSON.stringify(e.errors, null, 2));
            }
        }

    } catch (e: any) {
        console.error('Main error:', e.message);
    }
}

forceGrant();
