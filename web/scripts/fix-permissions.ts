import { createDirectus, rest, updatePermission, deletePermission, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function fixPermissions() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        // Delete duplicates (Permission 2)
        console.log("Deleting Permission 2...");
        try {
            await client.request(deletePermission(2));
            console.log("Deleted Permission 2.");
        } catch (e) {
            console.log("Permission 2 might not exist or error:", e);
        }

        // Update Permission 11 to ensure * and slug
        console.log("Updating Permission 11...");
        try {
            await client.request(updatePermission(11, {
                fields: ['*', 'slug']
            }));
            console.log("Updated Permission 11 with fields: ['*', 'slug'].");
        } catch (e) {
            console.error("Error updating Permission 11:", e);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixPermissions();
