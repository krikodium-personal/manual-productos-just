async function configureTips() {
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

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log('Creating fields for aromatherapy_tips...');

    // 2. Create 'description' field
    const descResponse = await fetch('http://localhost:8055/fields/aromatherapy_tips', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            field: 'description',
            type: 'text',
            meta: {
                interface: 'input-multiline', // Textarea
                display: 'raw',
                validation: null,
                required: false,
                width: 'full',
                note: 'Texto descriptivo del tip'
            },
            schema: {
                name: 'description',
                data_type: 'text'
            }
        })
    });
    const descData = await descResponse.json();
    if (descResponse.ok) {
        console.log('✅ Created field "description"');
    } else {
        // If conflict (409) just skip
        if (descResponse.status === 409) console.log('⚠️ Field "description" already exists');
        else console.error('Error creating description:', descData);
    }

    // 3. Create 'photo' field (Image)
    // Needs to link to directus_files
    const photoResponse = await fetch('http://localhost:8055/fields/aromatherapy_tips', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            field: 'photo',
            type: 'uuid',
            meta: {
                interface: 'file-image',
                display: 'image',
                special: ['file'],
                width: 'full',
                note: 'Foto ilustrativa'
            },
            schema: {
                name: 'photo',
                data_type: 'uuid',
                is_primary_key: false,
                foreign_key_table: 'directus_files',
                foreign_key_column: 'id',
                on_delete: 'SET NULL' // Safety
            }
        })
    });
    const photoData = await photoResponse.json();
    if (photoResponse.ok) {
        console.log('✅ Created field "photo"');
    } else {
        if (photoResponse.status === 409) console.log('⚠️ Field "photo" already exists');
        else console.error('Error creating photo:', photoData);
    }

    // 4. Rename Collection to "Tips Aroma"
    console.log('Updating collection label...');
    const renameResponse = await fetch('http://localhost:8055/collections/aromatherapy_tips', {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
            meta: {
                translations: [
                    {
                        language: 'es-ES',
                        translation: 'Tips Aroma',
                        singular: 'Tip Aroma',
                        plural: 'Tips Aroma'
                    },
                    {
                        language: 'es-419',
                        translation: 'Tips Aroma',
                        singular: 'Tip Aroma',
                        plural: 'Tips Aroma'
                    },
                    {
                        language: 'en-US',
                        translation: 'Tips Aroma',
                        singular: 'Tips Aroma',
                        plural: 'Tips Aroma'
                    }
                ]
            }
        })
    });

    if (renameResponse.ok) {
        console.log('✅ Updated collection label to "Tips Aroma"');
    } else {
        console.error('Error renaming collection:', await renameResponse.json());
    }
}

configureTips();
