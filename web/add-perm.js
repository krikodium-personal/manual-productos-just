async function addPermission() {
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

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log('Adding public read permission for general_precautions...');

    const response = await fetch('http://localhost:8055/permissions', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            role: null, // Public
            collection: 'general_precautions',
            action: 'read',
            fields: ['*']
        })
    });

    const data = await response.json();
    if (response.ok) {
        console.log('✅ Permission created successfully');
    } else {
        console.error('Error creating permission:', data);
    }
}

addPermission();
