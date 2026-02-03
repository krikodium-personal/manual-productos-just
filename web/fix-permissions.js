const { createDirectus, rest, readPermissions, createPermission, updatePermission } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function checkPermissions() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Get Public Role ID (usually checked via permissions where role is null)
        console.log('Checking permissions for Public role...');

        // We want to ensure Public (role: null) has read access to:
        // 1. vital_just_content
        // 2. vital_just_tips
        // 3. directus_files

        const collections = ['vital_just_content', 'vital_just_tips', 'directus_files'];

        for (const col of collections) {
            // Find existing permission
            // Using direct fetch because SDK readPermissions filter syntax can be tricky/version dependent
            const permRes = await fetch(`${url}/permissions?filter[role][_null]=true&filter[collection][_eq]=${col}&filter[action][_eq]=read`, {
                headers
            });
            const permData = await permRes.json();

            if (permData.data && permData.data.length > 0) {
                console.log(`✅ Public READ permission exists for ${col}`);
                // Ensure fields is '*'
                if (permData.data[0].fields && permData.data[0].fields[0] !== '*') {
                    console.log(`⚠️ Updating fields to '*' for ${col}...`);
                    await fetch(`${url}/permissions/${permData.data[0].id}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({ fields: ['*'] })
                    });
                }
            } else {
                console.log(`❌ Missing READ permission for ${col}. Creating...`);
                await fetch(`${url}/permissions`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        role: null, // Public
                        collection: col,
                        action: 'read',
                        fields: ['*']
                    })
                });
                console.log(`✅ Created permission for ${col}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkPermissions();
