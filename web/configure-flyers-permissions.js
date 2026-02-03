const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function configureFlyersPermissions() {
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

        const policyName = 'Public Read Flyers';
        const collection = 'vital_just_flyers';

        // 1. Check if Policy exists
        console.log(`Checking for existing policy: "${policyName}"...`);
        let policyId;
        const policiesRes = await fetch(`${url}/policies?filter[name][_eq]=${encodeURIComponent(policyName)}`, { headers });
        const policiesData = await policiesRes.json();

        if (policiesData.data && policiesData.data.length > 0) {
            policyId = policiesData.data[0].id;
            console.log('Found Policy ID:', policyId);
        } else {
            console.log('Policy NOT found. Creating...');
            const createPolicyRes = await fetch(`${url}/policies`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: policyName,
                    icon: 'public',
                    description: `Allow public read access to ${collection}`,
                    permissions: [
                        {
                            collection: collection,
                            action: 'read',
                            fields: ['*']
                        },
                        {
                            collection: 'directus_files', // Ensure files are readable too? Usually handled separately but good to check.
                            action: 'read',
                            fields: ['*']
                            // Might conflict if already set globally. Let's just focus on collection first.
                            // Files are usually public or handled by file permissions.
                        }
                    ]
                })
            });
            const createPolicyData = await createPolicyRes.json();
            if (createPolicyData.errors) {
                console.error('Error creating policy:', createPolicyData.errors);
                return;
            }
            policyId = createPolicyData.data.id;
            console.log('Created Policy ID:', policyId);
        }

        // 2. Assign Policy to Public Role (null)
        console.log(`Assigning Policy ${policyId} to Public Role (null)...`);

        // Check if access already exists?
        // Access is a many-to-many link. We can create it, if it exists usually it throws error or ignores.

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
            // Check if error is "Access already exists"
            // The error code or message might vary.
            console.log('Access creation result:', JSON.stringify(accessData.errors));
        } else {
            console.log('✅ Access granted to Public role (null).');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

configureFlyersPermissions();
