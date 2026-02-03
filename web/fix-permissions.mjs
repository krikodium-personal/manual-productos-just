
async function main() {
    console.log('Attempting login...');
    const loginRes = await fetch('http://localhost:8055/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
    });

    const loginData = await loginRes.json();
    const token = loginData?.data?.access_token;

    if (!token) {
        console.error('Login failed. Response:', JSON.stringify(loginData, null, 2));
        return;
    }

    console.log('Login successful. Creating permissions...');

    // Create Permission for Public (role: null) to Read Categories
    const permRes = await fetch('http://localhost:8055/permissions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            role: null,
            collection: 'categories',
            action: 'read',
            fields: ['*']
        })
    });

    // Check if it failed, maybe because it exists (400 or 409 usually, or just error payload)
    if (permRes.status >= 400) {
        const errData = await permRes.json();
        console.log('Permission request returned status', permRes.status);
        console.log('Response:', JSON.stringify(errData, null, 2));
    } else {
        const permData = await permRes.json();
        console.log('SUCCESS: Permission created.');
        console.log(JSON.stringify(permData, null, 2));
    }
}

main();
