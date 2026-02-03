import { createDirectus, rest, createPermission, authentication, readPolicies, readFieldsByCollection } from '@directus/sdk';
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Logged in as admin');

        console.log("Inspecting 'products' fields...");
        try {
            const fields = await client.request(readFieldsByCollection('products'));
            const fieldNames = fields.map((f: any) => f.field);
            console.log("Fields in 'products':", fieldNames);
            if (!fieldNames.includes('image')) console.warn("WARNING: 'image' field missing in 'products'");
            if (!fieldNames.includes('slug')) console.warn("WARNING: 'slug' field missing in 'products'");
        } catch (e) {
            console.error("Could not inspect products fields:", e);
        }

        console.log("Searching for Public policy...");
        const policies = await client.request(readPolicies());
        const publicPolicy = policies.find((p: any) => p.name === 'Public' || p.name === 'Public Permissions' || p.name === '$t:public_label');

        if (!publicPolicy) {
            console.error("Could not find a policy named 'Public'.");
            return;
        }

        console.log(`Found Public policy: ${publicPolicy.name} (${publicPolicy.id})`);

        // Added directus_files to the list
        const collections = ['products', 'products_ingredients', 'directus_files'];

        for (const collection of collections) {
            console.log(`Granting public read permission to '${collection}'...`);
            try {
                // First delete existing to ensure we update (optional, but cleaner if we want to reset strictness)
                // Actually, createPermission throws if duplicate. We'll stick to try-catch.

                await client.request(createPermission({
                    policy: publicPolicy.id,
                    collection: collection,
                    action: 'read',
                    permissions: {}, // Full read
                    fields: ['*']
                } as any));
                console.log(`Permission granted successfully for ${collection}.`);
            } catch (err: any) {
                if (err?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE' || err?.message?.includes('Duplicate')) {
                    console.log(`Permission already exists for ${collection}.`);
                } else {
                    console.error(`Error granting permission for ${collection}:`, err);
                }
            }
        }

    } catch (error: any) {
        console.error('Error:', error);
    }
}

main();
