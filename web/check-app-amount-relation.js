
const { createDirectus, rest, staticToken, readRelations } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function checkAppAmountRelation() {
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

        console.log('--- Checking Relations for products_custom_usage_modes ---');
        const relations = await client.request(readRelations());
        // find relations where field is application_amount
        const appRel = relations.find(r =>
            r.collection === 'products_custom_usage_modes' &&
            r.field === 'application_amount'
        );

        if (appRel) {
            console.log('Relation found:', JSON.stringify(appRel, null, 2));
        } else {
            console.log('NO RELATION FOUND for application_amount!');
        }

    } catch (e) {
        console.error(e);
    }
}
checkAppAmountRelation();
