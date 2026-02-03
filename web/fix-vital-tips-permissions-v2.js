const { createDirectus, rest } = require('@directus/sdk');

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
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // NEWER DIRECTUS VERSIONS: ACCESS + POLICIES
        // 1. Create a Policy for Reading Vital Tips (if not exists)
        console.log('Creating/Finding Policy...');
        let policyId;

        // Search for existing policy
        const policiesRes = await fetch(`${url}/policies?filter[name][_eq]=Public Read Vital Tips`, { headers });
        const policiesData = await policiesRes.json();

        if (policiesData.data && policiesData.data.length > 0) {
            policyId = policiesData.data[0].id;
            console.log('Found existing policy:', policyId);
        } else {
            // Create Policy
            // A policy contains permissions.
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
            if (createPolicyData.errors) {
                console.log('Error creating policy:', createPolicyData.errors);
                // Fallback: Use direct legacy way? No, likely legacy way failed.
                return;
            }
            policyId = createPolicyData.data.id;
            console.log('Created new policy:', policyId);
        }

        // 2. Assign Policy to Public Role (Access)
        console.log('Assigning Access to Public Role...');
        // Public role usually has ID 'null' conceptually, but in Access table we need to find the specific "Public" role ID if it exists? 
        // Or if it's truly anonymous.
        // Directus 10.10+ uses valid role IDs. 
        // Let's fetch the Public role again.

        const rolesRes = await fetch(`${url}/roles`, { headers });
        const rolesData = await rolesRes.json();
        const publicRole = rolesData.data.find(r => r.name === 'Public');

        if (publicRole) {
            const roleId = publicRole.id;
            console.log('Public Role ID:', roleId);

            // Create Access record
            const accessRes = await fetch(`${url}/access`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    role: roleId,
                    policy: policyId
                })
            });
            const accessData = await accessRes.json();
            if (accessData.errors) console.log('Access creation result:', accessData.errors[0].message); // Ignore unique constraint error
            else console.log('✅ Access granted to Public role.');

        } else {
            console.log('Could not find role named "Public". Using permissions endpoint legacy fallback...');
            // Fallback for older versions if "Public" role logic differs
            // ...
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixPermissions();
