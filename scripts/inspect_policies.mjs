import { createDirectus, rest, staticToken, readRoles, readPolicies, readItems } from '@directus/sdk';
import 'dotenv/config';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://directus-production-4078.up.railway.app';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
    console.error('Error: ADMIN_TOKEN env var is required.');
    process.exit(1);
}

const client = createDirectus(DIRECTUS_URL).with(staticToken(ADMIN_TOKEN)).with(rest());

async function run() {
    try {
        console.log('--- Roles ---');
        const roles = await client.request(readRoles({ limit: -1 }));
        roles.forEach(r => console.log(`Role: ${r.name} (ID: ${r.id})`));

        console.log('\n--- Policies ---');
        const policies = await client.request(readPolicies({ limit: -1 }));
        policies.forEach(p => console.log(`Policy: ${p.name} (ID: ${p.id})`));

        console.log('\n--- Access (Public) ---');
        try {
            // directus_access links role -> policy
            // For Public, role is null.
            const access = await client.request(readItems('directus_access', {
                filter: { role: { _null: true } }
            }));
            console.log(JSON.stringify(access, null, 2));
        } catch (err) {
            console.log("Could not read directus_access via readItems. Access might be restricted/different.");
            console.error(err.message);
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
