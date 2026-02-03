const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function fixPermissionsFinal() {
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

        // 1. Find the Policy ID we just created or searching for
        console.log('Finding Policy...');
        let policyId;
        const policiesRes = await fetch(`${url}/policies?filter[name][_eq]=Public Read Vital Tips`, { headers });
        const policiesData = await policiesRes.json();

        if (policiesData.data && policiesData.data.length > 0) {
            policyId = policiesData.data[0].id;
            console.log('Found Policy ID:', policyId);
        } else {
            console.log('Policy NOT found. Re-creating...');
            // ... (re-create logic if needed, but it should exist from previous run)
            const createPolicyRes = await fetch(`${url}/policies`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: 'Public Read Vital Tips',
                    icon: 'public',
                    description: 'Allow public read access to vital_just_tips',
                    permissions: [
                        {
                            collection: 'vital_just_tips',
                            action: 'read',
                            fields: ['*']
                        }
                    ]
                })
            });
            const createPolicyData = await createPolicyRes.json();
            policyId = createPolicyData.data.id;
        }

        // 2. Assign Scope/Access to Public (Role = null)
        console.log(`Assigning Policy ${policyId} to Public Role (null)...`);

        const accessRes = await fetch(`${url}/access`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                role: null, // Public
                policy: policyId
            })
        });

        const accessData = await accessRes.json();
        if (accessData.errors) {
            console.log('Access creation result:', accessData.errors[0].message);
        } else {
            console.log('✅ Access granted to Public role (null).');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixPermissionsFinal();
