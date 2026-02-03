const { createDirectus, rest, readPermissions } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function checkPermissions() {
    try {
        console.log('Authenticating via REST API to check permissions...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;

        // Fetch permissions
        const response = await fetch(`${url}/permissions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        // Check for public permission on 'faq'
        // Public role is usually null or specific UUID. strict check: role is null
        const faqPerms = data.data.filter(p => p.collection === 'faq');
        const publicFaq = faqPerms.find(p => p.role === null && p.action === 'read');

        console.log('FAQ Permissions:', JSON.stringify(faqPerms, null, 2));

        if (publicFaq) {
            console.log('✅ Public read permission exists for FAQ.');
        } else {
            console.log('❌ Missing public read permission for FAQ.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkPermissions();
