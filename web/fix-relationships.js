
const { createDirectus, rest, staticToken, createRelation } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function fixRelations() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });

        if (!authResponse.ok) {
            throw new Error('Authentication failed');
        }

        const authData = await authResponse.json();
        const token = authData.data.access_token;
        console.log('Authenticated as admin');

        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Creating relationship for usage_modes.application_amount -> application_amounts...');

        try {
            await client.request(createRelation({
                collection: 'usage_modes',
                field: 'application_amount',
                related_collection: 'application_amounts',
                schema: {
                    on_delete: 'SET NULL'
                },
                meta: {
                    one_field: null,
                    sort_field: null,
                    one_deselect_action: 'nullify',
                    one_allowed_collections: null,
                    one_collection_field: null,
                    one_collection: null,
                    junction_field: null,
                }
            }));
            console.log('Relationship created successfully!');
        } catch (e) {
            console.error('Error creating relationship:', e);
            // Check if it already exists but maybe malformed?
        }

    } catch (error) {
        console.error('Script failed:', error);
    }
}

fixRelations();
