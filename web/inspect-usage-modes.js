
const { createDirectus, rest, readCollections, readFields } = require('@directus/sdk');

const directus = createDirectus('http://localhost:8055').with(rest());

async function inspectUsageModes() {
    try {
        console.log('Fetching products fields...');
        const fields = await directus.request(readFields('products'));
        const usageModesField = fields.find(f => f.field === 'usage_modes');

        if (usageModesField) {
            console.log('Found usage_modes field:', usageModesField);
            // The collection it points to (junction)
            console.log('Junction Collection:', usageModesField.collection); // This is 'products'
            // We need to look at the relation
        } else {
            console.log('usage_modes field not found in products');
        }

        console.log('Fetching relations for products...');
        const relations = await directus.request(readCollections());
        // Actually readRelations is better but might need admin.
        // Let's try to infer from collections list or just look at all fields.

        // Let's try to list all collections to find likely candidates
        console.log('Collections:', relations.map(c => c.collection).filter(c => c.includes('usage')));

    } catch (err) {
        console.error('Error:', err);
    }
}

inspectUsageModes();
