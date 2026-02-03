const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function inspectProperties() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Fetch Policies
        console.log('Fetching Policies...');
        const policies = await fetch(`${url}/policies`, { headers });
        const policiesData = await policies.json();
        console.log('Policies:', policiesData.data.map(p => ({
            id: p.id,
            name: p.name,
            role: p.role
        })));

        // Fetch Roles to see their policy
        console.log('Fetching Roles...');
        const roles = await fetch(`${url}/roles`, { headers });
        const rolesData = await roles.json();
        // Public role usually has ID? Or is null.
        console.log('Roles:', rolesData.data.map(r => ({
            id: r.id,
            name: r.name,
            policies: r.policies
        })));


    } catch (error) {
        console.error('Error:', error);
    }
}

inspectProperties();
