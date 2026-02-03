const { createDirectus, rest, readRoles, readPolicies, createPermission } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function fixPermissions() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;

        // 1. Get Public Role (should be null or have specific ID, but likely we need to look at Policies directly or Role with name 'Public'?)
        // In Directus, "Public" is often a role with null ID, OR distinct.
        // Let's look for the policy attached to the public settings?
        // Actually, easier: List Roles. Find the one where name is "Public" or check how previous fix worked.
        // Previous fix found a policy named "Public" or similar?
        // Let's fetch policies.

        const policiesRes = await fetch(`${url}/policies`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const policiesData = await policiesRes.json();
        const publicPolicy = policiesData.data.find(p => p.name === 'Public'); // Assuming standard name

        if (!publicPolicy) {
            console.error('Could not find "Public" policy.');
            console.log('Available policies:', policiesData.data.map(p => p.name));
            return;
        }

        console.log(`Found Public Policy: ${publicPolicy.name} (${publicPolicy.id})`);

        // Check if permission already exists for this policy and collection
        const permsRes = await fetch(`${url}/permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const permsData = await permsRes.json();
        const existingPerm = permsData.data.find(p => p.policy === publicPolicy.id && p.collection === 'faq');

        if (existingPerm) {
            console.log('✅ Permission already exists for FAQ on Public Policy.');
        } else {
            console.log('Adding read permission for FAQ to Public Policy...');
            const createRes = await fetch(`${url}/permissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    policy: publicPolicy.id,
                    collection: 'faq',
                    action: 'read',
                    fields: ['*']
                })
            });

            if (createRes.ok) {
                console.log('✅ Successfully added read permission.');
            } else {
                const err = await createRes.json();
                console.error('Failed to add permission:', JSON.stringify(err, null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixPermissions();
