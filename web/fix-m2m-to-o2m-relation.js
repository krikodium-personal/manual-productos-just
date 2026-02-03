
const { createDirectus, rest, staticToken, updateRelation } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function fixRelation() {
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

        console.log('Updating relationship to remove junction_field (converting M2M -> O2M)...');

        await client.request(updateRelation('products_usage_modes', 'product_id', {
            meta: {
                junction_field: null, // Remove this to stop treating it as M2M junction
                one_field: 'usage_modes' // Ensure it still points to the alias on Product
            }
        }));

        console.log('Relationship updated successfully!');

    } catch (e) {
        console.error(e);
    }
}
fixRelation();
