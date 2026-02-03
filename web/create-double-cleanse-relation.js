const { createDirectus, rest } = require('@directus/sdk');

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

        console.log('Creating relation for vital_just_content.double_cleanse_image -> directus_files...');
        try {
            await fetch(`${url}/relations`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    collection: 'vital_just_content',
                    field: 'double_cleanse_image',
                    related_collection: 'directus_files',
                    meta: {
                        one_deselect_action: 'nullify'
                    }
                })
            }).then(async res => {
                const json = await res.json();
                if (json.errors) console.log('Result:', json.errors[0].message);
                else console.log('✅ Relation created.');
            });
        } catch (e) { console.log(e); }

    } catch (error) {
        console.error('Error:', error);
    }
}

createRelations();
