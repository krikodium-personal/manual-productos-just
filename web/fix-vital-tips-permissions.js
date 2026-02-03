const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function fixPermissions() {
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

        // 1. Get Public Role ID
        console.log('Fetching Public Role...');
        const rolesRes = await fetch(`${url}/roles`, { headers });
        const rolesData = await rolesRes.json();
        const publicRole = rolesData.data.find(r => r.name === 'Public') || { id: null }; // Public role usually has null ID or specific ID depending on version, but permissions use 'null' for public mostly or specific ID. Directus standard public role often has explicit ID in DB but "public" concept acts on null user. Wait, permissions for public are usually assigned to the role with name "Public".

        // Actually, for public access, we assign permission to the role that is configured as public. Standard is usually NULL role for unauthenticated, OR there's a specific "Public" role.
        // Let's check permissions endpoint.

        console.log('Checking permissions...');

        // We want to give READ permission to vital_just_tips for the PUBLIC role (which is usually null or a specific ID).
        // Best way is to just Create the permission.

        const permissionPayload = {
            role: null, // null = Public / Unauthenticated in many Directus setups, or we need to find the ID.
            collection: 'vital_just_tips',
            action: 'read',
            permissions: {}, // Full read
            fields: ['*']
        };

        // Try creating with role: null first (standard for "Public" in some versions, or check existing public permissions)
        console.log('Granting Public Read Access to vital_just_tips...');
        const response = await fetch(`${url}/permissions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(permissionPayload)
        });

        const result = await response.json();

        if (result.errors) {
            console.log('Error creating permission (might exist):', result.errors[0].message);

            // If it exists, maybe it doesn't have all fields?
            // Let's try update if needed, but usually error means it exists.
        } else {
            console.log('✅ Permission granted successfully.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixPermissions();
