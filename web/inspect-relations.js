
const { createDirectus, rest, staticToken, readRelations } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function inspectRelations() {
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

        const relations = await client.request(readRelations());
        // Find relation linking products and products_usage_modes
        const relevant = relations.filter(r =>
            r.collection === 'products_usage_modes' && r.field === 'usage_mode_id'
        );

        console.log('Usage Mode ID Relation:', JSON.stringify(relevant, null, 2));

    } catch (e) {
        console.error(e);
    }
}
inspectRelations();
