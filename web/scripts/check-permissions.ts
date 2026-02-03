
import { createDirectus, rest, readPermissions, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Reading permissions...");
        const permissions = await client.request(readPermissions({
            limit: -1
        }));

        // Find Public role ID (usually explicitly null or has a specific ID, let's look for known public role or check filtered list)
        // Public role usually has role: null
        const publicPerms = permissions.filter((p: any) => p.role === null);

        console.log("Public Permissions:");
        publicPerms.forEach((p: any) => {
            console.log(`- Collection: ${p.collection}, Action: ${p.action}`);
        });

        const junctionPerm = publicPerms.find((p: any) => p.collection === 'products_products');

        if (junctionPerm) {
            console.log("Junction Permission found:", junctionPerm);
        } else {
            console.log("WARNING: No Public permission found for 'products_products'!");
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
