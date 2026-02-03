import { createDirectus, rest, updatePermission, readPermissions, createPermission, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function forceSlugPermission() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

        console.log("Finding permission...");
        const permissions = await client.request(readPermissions({
            filter: {
                policy: { _eq: publicPolicyId },
                collection: { _eq: 'products' }
            }
        }));

        if (permissions.length > 0) {
            const perm = permissions[0];
            console.log("Updating existing permission:", perm.id);
            // Explicitly listing common fields plus slug to ensure it sticks, or just *
            await client.request(updatePermission(perm.id, {
                fields: ['*', 'slug', 'name', 'id']
            }));
            console.log("Updated.");
        } else {
            console.log("Creating new permission...");
            await client.request(createPermission({
                policy: publicPolicyId,
                collection: 'products',
                action: 'read',
                fields: ['*']
            }));
            console.log("Created.");
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

forceSlugPermission();
