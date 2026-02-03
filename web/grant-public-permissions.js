const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function grantPermissions() {
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

        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'; // Public Label

        // Define collections to grant read access
        const collections = [
            'products', 'categories', 'product_lines', 'needs', 'usage_modes', 'general_precautions',
            'application_amounts', 'vital_just_flyers', 'products_custom_usage_modes',
            'ingredients', 'products_ingredients', 'products_needs', 'products_attributes', 'attributes',
            'directus_files'
        ];

        console.log('Granting READ permissions (via Policy) to Public for:', collections);

        for (const col of collections) {
            // Check if permission exists for this policy
            const check = await fetch(`${url}/permissions?filter[policy][_eq]=${publicPolicyId}&filter[collection][_eq]=${col}&filter[action][_eq]=read`, { headers });
            const checkData = await check.json();

            if (checkData.data && checkData.data.length > 0) {
                console.log(`Permission for ${col} already exists. Updating fields to *...`);
                // Update to ensure all fields are readable?
                const permId = checkData.data[0].id;
                await fetch(`${url}/permissions/${permId}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        fields: ['*']
                    })
                });
            } else {
                console.log(`Creating permission for ${col}...`);
                const createRes = await fetch(`${url}/permissions`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        policy: publicPolicyId,
                        collection: col,
                        action: 'read',
                        fields: ['*']
                    })
                });

                if (!createRes.ok) {
                    console.error('Failed to create permission:', createRes.status, await createRes.text());
                } else {
                    console.log('Permission created!');
                }
            }
        }

        console.log('Permissions updated.');

    } catch (error) {
        console.error('Error:', error);
    }
}

grantPermissions();
