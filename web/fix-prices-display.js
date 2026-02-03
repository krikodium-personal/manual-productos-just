const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function fixPricesDisplay() {
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

        const collection = 'product_markets';
        const field = 'prices';

        console.log(`Updating ${collection} -> ${field} interface options...`);

        await fetch(`${url}/fields/${collection}/${field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    interface: 'list-o2m',
                    // The O2M interface uses 'fields' to know what to fetch
                    // and 'template' to know what to display in card/list view (if creating items inline).
                    // Or for table layout, it uses 'fields'.
                    // Let's assume list view for now.
                    special: ['o2m'],
                    options: {
                        template: '{{variant_id.capacity_value}} {{variant_id.capacity_unit}} - ${{price}}',
                        fields: ['variant_id.capacity_value', 'variant_id.capacity_unit', 'price']
                    },
                    display: 'related-values', // For when viewing the parent record in a list?
                    display_options: {
                        template: '{{prices.length}} Prices' // Just count for parent view
                    }
                }
            })
        });

        console.log('Display updated.');

    } catch (error) {
        console.error('Error:', error);
    }
}

fixPricesDisplay();
