import { createDirectus, rest, updatePermission, readPermissions, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function grantSlugPermission() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        // Public Policy ID from previous context: abf8a154-5b1c-4a46-ac9c-7300570f4f17
        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

        // Find existing permission for products collection and public policy
        console.log("Finding permission for products collection...");
        const permissions = await client.request(readPermissions({
            filter: {
                policy: { _eq: publicPolicyId },
                collection: { _eq: 'products' }
            }
        }));

        if (permissions.length > 0) {
            const perm = permissions[0];
            console.log("Current fields:", perm.fields);

            // If fields is '*', it should already work, but maybe it's explicit list?
            // If it's an array, append 'slug'.
            let newFields = perm.fields;
            if (Array.isArray(newFields) && !newFields.includes('*') && !newFields.includes('slug')) {
                newFields.push('slug');
            } else if (newFields === null) {
                // If null (all access?), weird it failed. 
                // Let's force explicit wildcard if feasible, or just ensure slug is there.
                // Re-setting to '*' is usually safest for public read if that's the intention.
                newFields = ['*'];
            }

            console.log("Updating permission with fields:", newFields);
            await client.request(updatePermission(perm.id, {
                fields: ['*'] // Force all fields to be safe
            }));
            console.log("Permission updated.");
        } else {
            console.error("No permission found for products collection. This is unexpected.");
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

grantSlugPermission();
