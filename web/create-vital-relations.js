const { createDirectus, rest, createRelation } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function createRelations() {
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

        // 1. Vital Just Tips -> Directus Files (Check and Create)
        console.log('Creating relation for vital_just_tips.photo -> directus_files...');
        try {
            // Need to use raw POST to /relations because SDK createRelation might act up if it thinks field conflicts
            await fetch(`${url}/relations`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    collection: 'vital_just_tips',
                    field: 'photo',
                    related_collection: 'directus_files',
                    schema: {
                        // We don't necessarily need to touch schema if column exists, 
                        // but it's safe to reiterate or let Directus handle it.
                        // Key thing is the META which Directus infers or sets defaults.
                    },
                    meta: {
                        sort_field: null,
                        one_collection_field: null,
                        one_allowed_collections: null,
                        junction_field: null,
                        one_deselect_action: 'nullify'
                    }
                })
            }).then(async res => {
                const json = await res.json();
                if (json.errors) {
                    // Ignore if "already exists" kind of error
                    console.log('Result:', json.errors[0].message);
                } else {
                    console.log('✅ Relation created for vital_just_tips.photo');
                }
            });
        } catch (e) { console.log(e); }

        // 2. Vital Just Content -> Hero Image has same issue? M2O file-image
        console.log('Creating relation for vital_just_content.hero_image -> directus_files...');
        try {
            await fetch(`${url}/relations`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    collection: 'vital_just_content',
                    field: 'hero_image',
                    related_collection: 'directus_files',
                    meta: {
                        one_deselect_action: 'nullify'
                    }
                })
            }).then(async res => {
                const json = await res.json();
                if (json.errors) console.log('Result:', json.errors[0].message);
                else console.log('✅ Relation created for vital_just_content.hero_image');
            });
        } catch (e) { console.log(e); }


    } catch (error) {
        console.error('Error:', error);
    }
}

createRelations();
