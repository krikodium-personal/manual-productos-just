import { createDirectus, rest, readPolicies, readRoles, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function inspect() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("--- ROLES ---");
        const roles = await client.request(readRoles());
        roles.forEach(r => console.log(`${r.name} (ID: ${r.id})`));

        console.log("\n--- POLICIES ---");
        const policies = await client.request(readPolicies());
        policies.forEach(p => console.log(`${p.name} (ID: ${p.id})`));

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

inspect();
