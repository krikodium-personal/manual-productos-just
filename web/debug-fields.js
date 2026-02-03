async function inspectFields() {
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

    // 2. Get Fields Info
    console.log('Fetching fields metadata...');
    const response = await fetch('http://localhost:8055/fields/usage_modes', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        const fields = data.data.map(f => f.field);
        console.log('Available Fields:', fields.join(', '));
    } else {
        const error = await response.json();
        console.error('Fetch failed:', error);
    }
}

inspectFields();
