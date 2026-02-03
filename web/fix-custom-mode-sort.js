
const { createDirectus, rest, staticToken, updateField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function fixSortAndCondition() {
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

        console.log('Updating custom_usage_modes sort and condition...');

        await client.request(updateField('products', 'custom_usage_modes', {
            meta: {
                sort: 504, // Directly after show_custom_usage_modes (503)
                conditions: [
                    {
                        rule: {
                            show_custom_usage_modes: {
                                _eq: false
                            }
                        },
                        hidden: true
                    }
                ]
            }
        }));

        console.log('Sort updated to 504 and conditional visibility added.');

    } catch (e) {
        console.error(e);
    }
}
fixSortAndCondition();
