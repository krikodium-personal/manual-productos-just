const { createDirectus, rest, readPermissions } = require('@directus/sdk');

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

        // Use ID for Public Policy if known: 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'
        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

        const response = await fetch(`${url}/permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        const existing = data.data.find(p => p.policy === publicPolicyId && p.collection === 'vital_just_content');

        if (existing) {
            console.log('✅ Permission exists for vital_just_content.');
        } else {
            console.log('❌ Missing permission for vital_just_content.');
            // Add it
            console.log('Adding permission...');
            const createRes = await fetch(`${url}/permissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    policy: publicPolicyId,
                    collection: 'vital_just_content',
                    action: 'read',
                    fields: ['*']
                })
            });
            if (createRes.ok) console.log('✅ Added permission.');
            else console.log('❌ Failed to add permission', await createRes.json());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkPermissions();
