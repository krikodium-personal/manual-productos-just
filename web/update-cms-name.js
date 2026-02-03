const { createDirectus, rest, staticToken, readCollections, updateCollection } = require('@directus/sdk');

// Use the static token from docker-compose.yml
const ADMIN_TOKEN = '255b5966-7b4c-4735-86f7-c9902f232328';

const directus = createDirectus('http://localhost:8055')
    .with(staticToken(ADMIN_TOKEN))
    .with(rest());

async function updateCollectionName() {
    console.log('Authenticating with static admin token...');

    try {
        console.log('Attempting to update collection name in CMS...');

        // 1. Fetch collection info to see current state
        const collections = await directus.request(readCollections());

        // Find collection by searching for one that looks like 'usage_modes'
        // In case it's named differently in the system
        const usageModesCollection = collections.find(c => c.collection === 'usage_modes');

        if (!usageModesCollection) {
            console.error('Error: Collection "usage_modes" not found.');
            console.log('Available collections:', collections.map(c => c.collection).join(', '));
            return;
        }

        console.log('Found collection:', usageModesCollection.collection);
        console.log('Current translations:', JSON.stringify(usageModesCollection.translations, null, 2));

        // 2. Update the translation/name
        await directus.request(updateCollection('usage_modes', {
            translations: [
                {
                    language: 'es-ES',
                    translation: 'Modos de empleo',
                    singular: 'Modo de empleo',
                    plural: 'Modos de empleo'
                }
            ]
        }));

        console.log('✅ Successfully updated collection name to "Modos de empleo".');

        // Verify update
        const updated = await directus.request(readCollections());
        const verify = updated.find(c => c.collection === 'usage_modes');
        console.log('New translations:', JSON.stringify(verify.translations, null, 2));

    } catch (error) {
        console.error('Error updating collection:', error);
        if (error.errors) {
            console.error('Details:', JSON.stringify(error.errors, null, 2));
        }
    }
}

updateCollectionName();
