async function addPermissionToPublicPolicy() {
    console.log('Authenticating via REST API...');

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

    // The ID found in previous step for "$t:public_label"
    const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

    console.log(`Adding permission to Public Policy (${publicPolicyId})...`);

    const permResp = await fetch('http://localhost:8055/permissions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            policy: publicPolicyId,
            collection: 'general_precautions',
            action: 'read',
            fields: ['*']
        })
    });

    if (permResp.ok) {
        console.log('✅ Permission created successfully on Public Policy');
    } else {
        const err = await permResp.json();
        // If conflict, check if it already exists
        if (permResp.status === 409) {
            console.log('⚠️ Permission already exists (Conflict)');
        } else {
            console.error('Failed to create permission:', JSON.stringify(err, null, 2));
        }
    }
}

addPermissionToPublicPolicy();
