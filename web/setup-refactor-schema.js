const { createDirectus, rest, staticToken, createCollection, createField } = require('@directus/sdk');

const url = 'http://localhost:8055';

async function setupSchema() {
    try {
        // 1. Authenticate via Fetch (Reliable)
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
        });

        if (!authResponse.ok) {
            throw new Error('Authentication failed');
        }

        const authData = await authResponse.json();
        const token = authData.data.access_token;
        console.log('Authenticated as admin');

        // 2. Initialize SDK with Token
        const client = createDirectus(url).with(rest()).with(staticToken(token));

        // 3. Create application_amounts collection
        try {
            await client.request(createCollection({
                collection: 'application_amounts',
                name: 'Cantidades por Aplicación',
                schema: {},
                meta: {
                    note: 'Define cantidades estándar para aplicaciones (ej: 5 gotas, 1ml)'
                }
            }));
            console.log('Created collection: application_amounts');
        } catch (e) {
            if (e.errors && e.errors[0].code === 'R_UNIQUE_KEY_VIOLATION') {
                console.log('Collection application_amounts already exists');
            } else {
                console.error('Error creating collection:', e);
            }
        }

        // 4. Add fields to application_amounts
        const fieldsToAdd = [
            { field: 'name', type: 'string', meta: { interface: 'input', special: null, display: 'raw', verbose: false, note: 'Nombre descriptivo (ej: 5 gotas)' } },
            { field: 'amount', type: 'float', meta: { interface: 'input', special: null, display: 'raw', verbose: false, note: 'Cantidad numérica (ej: 0.25)' } },
            { field: 'unit', type: 'string', meta: { interface: 'select-radio', options: { choices: [{ text: 'ml', value: 'ml' }, { text: 'gr', value: 'gr' }] }, special: null, display: 'raw', verbose: false, note: 'Unidad de medida' } }
        ];

        for (const f of fieldsToAdd) {
            try {
                await client.request(createField('application_amounts', f));
                console.log(`Created field ${f.field} in application_amounts`);
            } catch (e) {
                console.log(`Field ${f.field} might already exist or failed:`, e.message);
            }
        }

        // 5. Update usage_modes collection
        // Add is_aromatherapy
        try {
            await client.request(createField('usage_modes', {
                field: 'is_aromatherapy',
                type: 'boolean',
                schema: { default_value: false },
                meta: { interface: 'boolean', special: null, display: 'boolean', verbose: false, note: 'Mostrar en sección Aromaterapia' }
            }));
            console.log('Created field is_aromatherapy in usage_modes');
        } catch (e) {
            console.log('Field is_aromatherapy might already exist');
        }

        // Add application_amount M2O
        try {
            await client.request(createField('usage_modes', {
                field: 'application_amount',
                type: 'integer',
                meta: { interface: 'select-dropdown-m2o', special: ['m2o'], display: 'related-values', verbose: false, note: 'Cantidad asociada' },
                schema: { foreign_key_column: 'id', foreign_key_table: 'application_amounts' }
            }));
            console.log('Created field application_amount in usage_modes');
        } catch (e) {
            console.log('Field application_amount might already exist', e.message);
        }

        console.log('Schema setup complete');

    } catch (error) {
        console.error('Setup failed:', error);
    }
}

setupSchema();
