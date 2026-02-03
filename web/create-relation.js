async function createRelation() {
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

    console.log('Creating relation for photo...');

    const response = await fetch('http://localhost:8055/relations', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            collection: 'aromatherapy_tips',
            field: 'photo',
            related_collection: 'directus_files',
            schema: {
                on_delete: 'SET NULL'
            }
        })
    });

    const data = await response.json();
    if (response.ok) {
        console.log('✅ Relation created successfully');
    } else {
        console.error('Error creating relation:', data);
    }
}

createRelation();
