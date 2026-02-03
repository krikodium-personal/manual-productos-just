import { createDirectus, rest, createPermission, authentication, readPolicies } from '@directus/sdk';
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

        console.log("Searching for Public policy...");
        const policies = await client.request(readPolicies());
        const publicPolicy = policies.find((p: any) => p.name === 'Public' || p.name === 'Public Permissions' || p.name === '$t:public_label');

        if (!publicPolicy) {
            console.error("Could not find a policy named 'Public'. Available policies:", policies.map((p: any) => p.name));
            return;
        }

        console.log(`Found Public policy: ${publicPolicy.name} (${publicPolicy.id})`);

        console.log("Granting public read permission to 'terminology'...");
        try {
            await client.request(createPermission({
                policy: publicPolicy.id,
                collection: 'terminology',
                action: 'read',
                permissions: {}, // Full read access
                fields: ['*'] // All fields
            } as any));
            console.log("Permission granted successfully.");
        } catch (err: any) {
            if (err?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE' || err?.message?.includes('Duplicate')) {
                console.log("Permission already exists.");
            } else {
                throw err;
            }
        }

    } catch (error: any) {
        console.error('Error:', error);
        if (error?.errors) {
            console.error('Directus Errors:', JSON.stringify(error.errors, null, 2));
        }
    }
}

main();
