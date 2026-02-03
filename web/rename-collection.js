const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function renameCollection() {
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

        const collection = 'vital_just_flyers';
        const newName = 'Flyers Vital Just';

        console.log(`Renaming collection ${collection} to "${newName}"...`);

        const translations = [
            { language: 'es-ES', translation: newName, singular: 'Flyer', plural: newName },
            { language: 'es-419', translation: newName, singular: 'Flyer', plural: newName },
            { language: 'en-US', translation: newName, singular: 'Flyer', plural: newName }
        ];

        const response = await fetch(`${url}/collections/${collection}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    translations: translations,
                    // Also update note if needed? Keep existing or update?
                    // note: 'Collection for Flyers Vital Just' 
                }
            })
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Error renaming:', data.errors);
        } else {
            console.log('✅ Collection renamed successfully.');
            console.log('New Translations:', data.data.meta.translations);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

renameCollection();
