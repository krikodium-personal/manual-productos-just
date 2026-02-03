const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function createRelation() {
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

        console.log('Creating relation for hero_image...');

        // Relation payload: connects vital_just_content.hero_image -> directus_files.id
        const relationPayload = {
            collection: 'vital_just_content',
            field: 'hero_image',
            related_collection: 'directus_files',
            schema: {
                on_delete: 'SET NULL',
            },
            meta: {
                sort_field: null,
                one_collection_field: null,
                one_allowed_collections: null,
                one_deselect_action: 'nullify',
                junction_field: null,
                display: 'image'
            }
        };

        const response = await fetch(`${url}/relations`, {
            method: 'POST',
            headers,
            body: JSON.stringify(relationPayload)
        });

        if (response.ok) {
            console.log('✅ Relation created successfully.');
        } else {
            console.error('❌ Failed to create relation:', await response.json());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

createRelation();
