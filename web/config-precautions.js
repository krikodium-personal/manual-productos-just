async function configurePrecautions() {
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

    console.log('Creating fields for general_precautions...');

    // 2. Create 'description' field
    const descResponse = await fetch('http://localhost:8055/fields/general_precautions', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            field: 'description',
            type: 'text',
            meta: {
                interface: 'input-multiline', // Textarea for long text
                display: 'raw',
                validation: null,
                required: false,
                width: 'full',
                note: 'Descripción larga de la precaución'
            },
            schema: {
                name: 'description',
                data_type: 'text'
            }
        })
    });

    if (descResponse.ok) {
        console.log('✅ Created field "description"');
    } else {
        if (descResponse.status === 409) console.log('⚠️ Field "description" already exists');
        else console.error('Error creating description:', await descResponse.json());
    }

    // 3. Rename Collection to "Precauciones Grales."
    console.log('Updating collection label...');
    const renameResponse = await fetch('http://localhost:8055/collections/general_precautions', {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({
            meta: {
                translations: [
                    {
                        language: 'es-ES',
                        translation: 'Precauciones Grales.',
                        singular: 'Precaución',
                        plural: 'Precauciones Grales.'
                    },
                    {
                        language: 'es-419',
                        translation: 'Precauciones Grales.',
                        singular: 'Precaución',
                        plural: 'Precauciones Grales.'
                    },
                    {
                        language: 'en-US',
                        translation: 'General Precautions',
                        singular: 'Precaution',
                        plural: 'General Precautions'
                    }
                ]
            }
        })
    });

    if (renameResponse.ok) {
        console.log('✅ Updated collection label to "Precauciones Grales."');
    } else {
        console.error('Error renaming collection:', await renameResponse.json());
    }
}

configurePrecautions();
