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
    const token = loginData.data?.access_token;

    if (!token) {
        console.error('Login failed');
        return;
    }

    console.log('✅ Obtained access token.');

    // 2. Update Collection - Try nesting in 'meta'
    // Ensure we cover all found languages from the debug step
    const newTranslations = [
        {
            language: 'es-ES',
            translation: 'Modos de empleo',
            singular: 'Modo de empleo',
            plural: 'Modos de empleo'
        },
        {
            language: 'es-419', // Latin America
            translation: 'Modos de empleo',
            singular: 'Modo de empleo',
            plural: 'Modos de empleo'
        },
        {
            language: 'en-US', // Default fallback often
            translation: 'Modos de empleo', // Kept Spanish as requested even in EN config for consistency
            singular: 'Modo de empleo',
            plural: 'Modos de empleo'
        }
    ];

    console.log('Updating collection metadata (root property approach)...');

    // Attempt 1: Root property (standard Directus behavior usually)
    let updateResponse = await fetch('http://localhost:8055/collections/usage_modes', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            meta: {
                translations: newTranslations
            }
        })
    });

    // If Directus version is older/newer, maybe it wants it in root?
    // Let's inspect result
    let data = await updateResponse.json();
    console.log('Update Result (Meta approach):', JSON.stringify(data.data?.meta?.translations, null, 2));

    // Verify if it stuck
    const checkResponse = await fetch('http://localhost:8055/collections/usage_modes', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const checkData = await checkResponse.json();
    const currentTrans = checkData.data?.meta?.translations;

    const isFixed = currentTrans && currentTrans.some(t => t.translation === 'Modos de empleo');

    if (!isFixed) {
        console.log('⚠️ Meta approach failed. Trying Root property approach...');
        // Attempt 2: Root property
        updateResponse = await fetch('http://localhost:8055/collections/usage_modes', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                translations: newTranslations
            })
        });
        data = await updateResponse.json();
        console.log('Update Result (Root approach):', JSON.stringify(data, null, 2));
    } else {
        console.log('✅ Update successful via Meta approach!');
    }
}

updateCMS();
