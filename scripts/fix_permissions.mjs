import { createDirectus, rest, authentication, staticToken, updatePermission, createPermission, readPermissions } from '@directus/sdk';
import 'dotenv/config';

// Config
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://directus-production-4078.up.railway.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

let client;

if (ADMIN_TOKEN) {
    client = createDirectus(DIRECTUS_URL).with(staticToken(ADMIN_TOKEN)).with(rest());
} else if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    client = createDirectus(DIRECTUS_URL).with(authentication()).with(rest());
} else {
    console.error('Error: ADMIN_TOKEN or (ADMIN_EMAIL and ADMIN_PASSWORD) env vars are required.');
    process.exit(1);
}

async function run() {
    try {
        console.log(`Connecting to ${DIRECTUS_URL}...`);

        if (!ADMIN_TOKEN) {
            await client.login({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
            console.log('Authenticated as Admin via Email/Password.');
        } else {
            console.log('Authenticated via Token.');
        }

        // Target collections to allow Public Read access
        const collections = ['variants', 'product_variants', 'product_variant_prices'];

        for (const collection of collections) {
            console.log(`Attempting to grant Permission for Public role on collection: ${collection}`);

            // Simply try to create the permission
            // Public role is null
            try {
                await client.request(createPermission({
                    // role: null, // Deprecated? Or just not used when policy is specified? 
                    // In new Directus, permission is linked to policy, policy is linked to role.
                    // We attach to the Public Policy.
                    policy: 'abf8a154-5b1c-4a46-ac9c-7300570f4f17', // Public Policy ID
                    collection: collection,
                    action: 'read',
                    permissions: {}, // Full read access
                    fields: ['*'] // All fields
                }));
                console.log(`✅ Created Public Read permission for ${collection}`);
            } catch (err) {
                // If error is 403 (RECORD_NOT_UNIQUE for permissions? Or Forbidden?)
                // Actually Directus returns 403 Forbidden if permissions duplicate? Key constraint?
                // The error message from previous attempt was Forbidden for READ.
                // Let's inspect the error.
                if (err.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE' || err.message.includes('unique')) {
                    console.log(`✅ Permission already exists for ${collection} (caught unique error).`);
                } else if (JSON.stringify(err).includes('Forbidden')) {
                    console.log(`❌ Forbidden: Try to verify if permission exists manually. Error: ${err.message}`);
                } else {
                    console.error(`❌ Failed to create permission for ${collection}:`, err.message);
                }
            }
        }

        console.log('Done.');

    } catch (e) {
        console.error('Error:', e);
    }
}


run();
