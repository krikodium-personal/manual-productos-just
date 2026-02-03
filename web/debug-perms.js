async function checkPermissions() {
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

    console.log('✅ Obtained access token.');

    // 2. Check Permissions for Public (role = null) on general_precautions
    const response = await fetch('http://localhost:8055/permissions', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        const publicPerms = data.data.filter(p => p.role === null && p.collection === 'general_precautions');
        console.log('Public Permissions for general_precautions:', JSON.stringify(publicPerms, null, 2));

        // Also check if collection name is correct just in case
        const collectionsResp = await fetch('http://localhost:8055/collections/general_precautions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!collectionsResp.ok) {
            console.error('Collection check failed:', await collectionsResp.json());
        } else {
            console.log('Collection exists.');
        }

    } else {
        console.error('Fetch permissions failed:', await response.json());
    }
}

checkPermissions();
