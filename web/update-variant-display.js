const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function updateVariantDisplay() {
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
        const field = 'variant_id';

        console.log(`Updating interface options for ${field}...`);

        await fetch(`${url}/fields/${collection}/${field}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                meta: {
                    interface: 'select-dropdown-m2o',
                    options: {
                        template: '{{capacity_value}} {{capacity_unit}}'
                    },
                    display: 'related-values',
                    display_options: {
                        template: '{{capacity_value}} {{capacity_unit}}'
                    }
                }
            })
        });

        console.log('Display updated.');

    } catch (error) {
        console.error('Error:', error);
    }
}

updateVariantDisplay();
