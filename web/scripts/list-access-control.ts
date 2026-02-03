
import { createDirectus, rest, readRoles, readPolicies, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("--- Roles ---");
        const roles = await client.request(readRoles());
        roles.forEach((r: any) => console.log(`${r.name} (ID: ${r.id})`));

        console.log("\n--- Policies ---");
        const policies = await client.request(readPolicies());
        policies.forEach((p: any) => console.log(`${p.name} (ID: ${p.id})`));

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
