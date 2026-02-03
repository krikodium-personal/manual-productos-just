const { createDirectus, rest, readItems } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function listFlyers() {
    try {
        // Authenticate as Admin to be sure
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;

        console.log('Fetching flyers...');
        // Use fetch directly to avoid SDK requiring setToken (though I can use setToken)
        const response = await fetch(`${url}/items/vital_just_flyers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        console.log('Items:', data.data);

        // Also check Public Access
        console.log('Checking Public Access...');
        const publicRes = await fetch(`${url}/items/vital_just_flyers`);
        const publicData = await publicRes.json();
        if (publicData.errors) {
            console.error('Public Access Error:', publicData.errors[0].message);
        } else {
            console.log('Public Access Items:', publicData.data?.length);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listFlyers();
