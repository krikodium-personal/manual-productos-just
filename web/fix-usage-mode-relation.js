
const { createDirectus, rest, staticToken, updateRelation } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function fixUsageModeRelation() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Updating usage_mode_id relationship to remove junction_field...');

        await client.request(updateRelation('products_usage_modes', 'usage_mode_id', {
            meta: {
                junction_field: null // Remove this to stop treating it as M2M junction
            }
        }));

        console.log('Relationship usage_mode_id updated successfully!');

    } catch (e) {
        console.error(e);
    }
}
fixUsageModeRelation();
