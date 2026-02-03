async function inspectRelations() {
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

    // 2. Get Relations
    const response = await fetch('http://localhost:8055/relations/aromatherapy_tips', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Relations Data:', JSON.stringify(data.data, null, 2));
    } else {
        // If getting specific collection relations fails, try getting ALL and filtering
        const allResponse = await fetch('http://localhost:8055/relations', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const allData = await allResponse.json();
        const relevant = allData.data.filter(r => r.collection === 'aromatherapy_tips');
        console.log('Relations Filtered:', JSON.stringify(relevant, null, 2));
    }
}

inspectRelations();
