// Test script to debug Directus search
const { createDirectus, rest, readItems } = require('@directus/sdk');

const directus = createDirectus('http://localhost:8055').with(rest());

async function testSearch() {
    console.log('Testing Directus search...\n');

    try {
        console.log('1. Fetching all products (no filter):');
        const allProducts = await directus.request(readItems('products', {
            fields: ['id', 'name'],
            limit: 3
        }));
        console.log('   Result:', JSON.stringify(allProducts, null, 2));
    } catch (error) {
        console.error('   Error:', error.message);
        console.error('   Details:', error);
    }

    console.log('\n2. Searching products with filter (name contains "aceite"):');
    try {
        const filteredProducts = await directus.request(readItems('products', {
            filter: {
                name: {
                    _icontains: 'aceite'
                }
            },
            fields: ['id', 'name', 'slug'],
            limit: 5
        }));
        console.log('   Result:', JSON.stringify(filteredProducts, null, 2));
    } catch (error) {
        console.error('   Error:', error.message);
        console.error('   Details:', error);
    }
}

testSearch();
