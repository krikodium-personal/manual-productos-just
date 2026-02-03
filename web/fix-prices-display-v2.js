const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function fixPricesDisplayV2() {
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

        console.log(`Updating ${collection} -> ${field} interface options with explicit nested fields...`);

        // Use "template" for list view (inline) OR "fields" for table view.
        // If inline edit (drawer), it uses "template".
        // Let's set both correctly.

        await fetch(`${url}/fields/${collection}/${field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    interface: 'list-o2m',
                    // Fields must include the relational key itself + subfields.
                    options: {
                        template: '{{variant_id.capacity_value}}{{variant_id.capacity_unit}} - ${{price}}',
                        fields: [
                            'id',
                            'price',
                            'variant_id',
                            'variant_id.capacity_value',
                            'variant_id.capacity_unit'
                        ],
                        enableCreate: true,
                        enableSelect: false // Usually don't select existing prices, just create new ones linked to parent.
                    },
                    display: 'related-values',
                    display_options: {
                        template: '{{prices.length}} Prices'
                    }
                }
            })
        });

        console.log('Display (v2) updated.');

    } catch (error) {
        console.error('Error:', error);
    }
}

fixPricesDisplayV2();
