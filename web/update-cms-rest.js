async function updateCMS() {
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

    // 2. Update Collection
    console.log('Updating collection metadata...');
    const updateResponse = await fetch('http://localhost:8055/collections/usage_modes', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            translations: [
                {
                    language: 'es-ES',
                    translation: 'Modos de empleo',
                    singular: 'Modo de empleo',
                    plural: 'Modos de empleo'
                }
            ]
        })
    });

    if (updateResponse.ok) {
        const data = await updateResponse.json();
        console.log('✅ Successfully updated collection "usage_modes" to "Modos de empleo"');
        console.log('New translations:', data.data.translations);
    } else {
        const error = await updateResponse.json();
        console.error('Update failed:', error);
    }
}

updateCMS();
