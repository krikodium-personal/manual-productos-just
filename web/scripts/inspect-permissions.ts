import { createDirectus, rest, readPermissions, readRoles, readPolicies, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function inspectPermissions() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("--- Roles ---");
        const roles = await client.request(readRoles());
        const publicRole = roles.find(r => r.name === 'Public') || roles.find(r => r.id === null); // Public role might not be in list or have specific name?
        // Actually public is usually treated as unauthenticated.
        console.log("Roles found:", roles.map(r => `${r.name} (${r.id})`));

        console.log("\n--- Policies ---");
        const policies = await client.request(readPolicies());
        console.log("Policies found:", policies.map(p => `${p.name} (${p.id})`));

        console.log("\n--- Permissions for 'products' ---");
        const permissions = await client.request(readPermissions({
            filter: {
                collection: { _eq: 'products' }
            },
            fields: ['*', 'policy.*', 'policy.name'] // Try to expand policy
        }));

        permissions.forEach(p => {
            console.log(`Permission ID: ${p.id}`);
            console.log(`  Policy: ${p.policy} (${(p as any).policy?.name})`);
            console.log(`  Action: ${p.action}`);
            console.log(`  Fields: ${p.fields}`);
            console.log("--------------------------------");
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectPermissions();
