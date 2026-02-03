const { createDirectus, rest, staticToken } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';

async function cleanup() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = { 'Authorization': `Bearer ${token}` };

        console.log('Deleting legacy field vehicular_content_id...');
        const deleteResponse = await fetch(`${url}/fields/vehicular_advantages/vehicular_content_id`, {
            method: 'DELETE',
            headers
        });

        if (deleteResponse.ok || deleteResponse.status === 404) {
            console.log('Legacy field deleted or already gone.');
        } else {
            console.error('Failed to delete legacy field:', await deleteResponse.text());
        }

        console.log('Hiding vehiculares_id field if present...');
        await fetch(`${url}/fields/vehicular_advantages/vehiculares_id`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                meta: { hidden: true }
            })
        });

        console.log('Done!');
    } catch (e) {
        console.error('Cleanup failed:', e);
    }
}

cleanup();
