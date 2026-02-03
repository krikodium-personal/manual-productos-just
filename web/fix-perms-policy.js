async function fixPermissions() {
    console.log('Authenticating via REST API...');

    // 1. Login
    const loginResponse = await fetch('http://localhost:8055/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@example.com',
            password: 'password'
        })
    });

    const loginData = await loginResponse.json();
    const token = loginData.data?.access_token;

    if (!token) {
        console.error('Login failed');
        return;
    }

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. Identify Public Policy
    // In Directus, permissions are attached to policies, and roles have policies.
    // We need to find the policy used for public access. In standard setup, there's often a "Public" role or it's just no role.
    // If "Public" access is enabled, there might be a specific policy.
    // Let's list roles to see if there's a Public role.

    const rolesResp = await fetch('http://localhost:8055/roles', { headers });
    const roles = (await rolesResp.json()).data;
    console.log('Roles:', roles.map(r => ({ id: r.id, name: r.name })));

    // Finding Public role (usually name "Public" or just relying on "null" user not needing permissions? No, public users need permissions).
    // Actually, in recent Directus, Public permissions are attached to a specific Role (often called Public) OR directly via `null` in old versions but now it requires policy.

    // Let's look for a policy named "Public" or similar.
    const policiesResp = await fetch('http://localhost:8055/policies', { headers });
    const policies = (await policiesResp.json()).data;
    console.log('Policies:', policies.map(p => ({ id: p.id, name: p.name })));

    let publicPolicy = policies.find(p => p.name === 'Public');

    // If not found, look for role "Public" and its policies
    if (!publicPolicy) {
        // Fallback: Create a policy named Public if it doesn't exist?
        // Or if we just want "Public" access, we usually edit the Public Role's permissions.
        // Let's check roles again.
    }

    // Directus Basic: Settings -> Public Role.
    // We can check settings to see which role is the Public Role.
    const settingsResp = await fetch('http://localhost:8055/settings', { headers });
    const settings = (await settingsResp.json()).data;
    const publicRoleId = settings.public_role; // This is the ID of the role used for public

    console.log('Public Role ID from settings:', publicRoleId);

    if (publicRoleId) {
        // If we have a public role, we need to add a permission for THAT role's policy? 
        // Wait, normally we just add permission with `role: publicRoleId` in older API, but error said "policy is required".
        // This implies we are creating a permission object that LINKS a policy to a collection.
        // So we need to find which policy belongs to the public role, or create a new policy and assign it?
        // No, simplest way: Just add permission with `policy` set to one of the policies of the public role.
        // But permissions are now children of policies.
        // So:
        // 1. Get policies of the public role.
        // 2. Choose one (or create one).
        // 3. Add permission to that policy.

        // Fetch role to see policies
        const roleResp = await fetch(`http://localhost:8055/roles/${publicRoleId}`, { headers });
        const role = (await roleResp.json()).data;
        // Roles have `policies` array (m2m).
        console.log('Public Role Policies:', role.policies);

        // If role has policies, pick the first one? Or "Public" one?
        // If role.policies is array of IDs (or objects depending on fetch depth).
        // Let's assume we can use the first policy found or need to inspect.

        // If no policies in public role, create one "Public Access" and assign to role.
        let policyId;
        if (role.policies && role.policies.length > 0) {
            policyId = typeof role.policies[0] === 'string' ? role.policies[0] : role.policies[0].id;
        } else {
            console.log('Creating new policy for Public role...');
            const newPolicyResp = await fetch('http://localhost:8055/policies', {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: 'Public Permissions' })
            });
            const newPolicy = (await newPolicyResp.json()).data;
            policyId = newPolicy.id;

            // Assign to role
            await fetch(`http://localhost:8055/roles/${publicRoleId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ policies: [policyId] })
            });
        }

        console.log(`Using Policy ID: ${policyId}`);

        // 3. Create Permission for general_precautions on this Policy
        const permResp = await fetch('http://localhost:8055/permissions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                policy: policyId,
                collection: 'general_precautions',
                action: 'read',
                fields: ['*']
            })
        });

        if (permResp.ok) {
            console.log('✅ Public Permission created successfully');
        } else {
            console.error('Failed to create permission:', await permResp.json());
        }

    } else {
        console.log('⚠️ No Public Role defined in settings. Cannot assign public permissions.');
    }
}

fixPermissions();
