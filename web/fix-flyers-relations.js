const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function fixFlyersRelations() {
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

        // Define fields to update
        const fieldsToFix = ['image', 'file'];

        for (const field of fieldsToFix) {
            console.log(`Fixing relationship for ${field}...`);

            // To add a FK, we might need to update the field.
            // Directus API allows updating field schema.
            // However, if the column already exists as basic UUID without FK, we might need to Alter it.
            // The /fields/:collection/:field endpoint supports "schema" updates.

            const updatePayload = {
                schema: {
                    foreign_key_table: 'directus_files',
                    foreign_key_column: 'id',
                    // Constraint name might be auto-generated or optional
                }
            };

            const response = await fetch(`${url}/fields/${collection}/${field}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(updatePayload)
            });

            if (response.ok) {
                console.log(`✅ Field ${field} updated with FK relationship.`);
            } else {
                const err = await response.json();
                console.error(`❌ Failed to update ${field}:`, JSON.stringify(err, null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixFlyersRelations();
