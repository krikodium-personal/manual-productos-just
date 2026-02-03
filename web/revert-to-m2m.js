
const { createDirectus, rest, staticToken, updateField, updateRelation } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function revertToM2M() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const client = createDirectus(url).with(rest()).with(staticToken(token));

        console.log('Reverting products.usage_modes interface to list-m2m...');

        // 1. Update Product Field Interface
        await client.request(updateField('products', 'usage_modes', {
            meta: {
                interface: 'list-m2m',
                special: ['m2m'],
                options: {
                    enableCreate: false, // Standard M2M usually doesn't create inline
                    enableSelect: true,
                    template: '{{usage_mode_id.title}}' // Ensure it shows the title of the usage mode
                }
            }
        }));

        console.log('Reverting Relationships Metadata...');

        // 2. Update products_usage_modes -> product_id (Restore junction_field)
        await client.request(updateRelation('products_usage_modes', 'product_id', {
            meta: {
                junction_field: 'usage_mode_id',
                one_field: 'usage_modes'
            }
        }));

        // 3. Update products_usage_modes -> usage_mode_id (Restore junction_field)
        await client.request(updateRelation('products_usage_modes', 'usage_mode_id', {
            meta: {
                junction_field: 'product_id'
            }
        }));

        console.log('Reverted to M2M successfully!');

    } catch (e) {
        console.error(e);
    }
}
revertToM2M();
