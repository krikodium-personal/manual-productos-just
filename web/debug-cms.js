async function inspectCMS() {
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

    if (!loginData.data || !loginData.data.access_token) {
        console.error('Login failed:', loginData);
        return;
    }

    const token = loginData.data.access_token;
    console.log('✅ Obtained access token.');

    // 2. Get Collection Info
    console.log('Fetching collection metadata...');
    const response = await fetch('http://localhost:8055/collections/usage_modes', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Collection Metadata:', JSON.stringify(data.data, null, 2));
    } else {
        const error = await response.json();
        console.error('Fetch failed:', error);
    }
}

inspectCMS();
