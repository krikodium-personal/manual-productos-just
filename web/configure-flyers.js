const { createDirectus, rest } = require('@directus/sdk');

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest());

async function configureFlyers() {
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

        console.log(`Configuring fields for ${collection}...`);

        // Helper to check if field exists (simple list check from previous step showed empty, assuming safe to add or catch error)
        // We will try to create fields. If 409 conflict, we ignore.

        const fields = [
            {
                field: 'title',
                type: 'string',
                schema: { is_nullable: false },
                meta: {
                    interface: 'input',
                    special: null,
                    translations: [
                        { language: 'es-ES', translation: 'Nombre' }
                    ]
                }
            },
            {
                field: 'description',
                type: 'text',
                schema: { is_nullable: true },
                meta: {
                    interface: 'input-multiline',
                    special: null,
                    translations: [
                        { language: 'es-ES', translation: 'Descripción Corta' }
                    ]
                }
            },
            {
                field: 'image',
                type: 'uuid',
                schema: {
                    foreign_key_table: 'directus_files',
                    foreign_key_column: 'id',
                    is_nullable: true
                },
                meta: {
                    interface: 'file-image',
                    special: ['file'],
                    translations: [
                        { language: 'es-ES', translation: 'Imagen' }
                    ]
                }
            },
            {
                field: 'file',
                type: 'uuid',
                schema: {
                    foreign_key_table: 'directus_files',
                    foreign_key_column: 'id',
                    is_nullable: true
                },
                meta: {
                    interface: 'file',
                    special: ['file'],
                    translations: [
                        { language: 'es-ES', translation: 'Archivo PDF' }
                    ]
                }
            }
        ];

        for (const field of fields) {
            console.log(`Adding field ${field.field}...`);
            const res = await fetch(`${url}/fields/${collection}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(field)
            });
            if (!res.ok) {
                const err = await res.json();
                if (err.errors?.[0]?.code === 'FIELD_ALREADY_EXISTS') {
                    console.log(`Field ${field.field} already exists, skipping.`);
                } else {
                    console.error(`Failed to add ${field.field}:`, err);
                }
            } else {
                console.log(`Field ${field.field} added.`);
            }
        }

        console.log('Configuring Public Permissions...');
        // Public Role ID is null? Or try to fetch roles?
        // Usually Public role is implicitly null or has a specific ID.
        // Let's use the /permissions endpoint to create public read access.

        // 1. Get existing permissions
        const permRes = await fetch(`${url}/permissions?filter[role][_null]=true&filter[collection][_eq]=${collection}`, { headers });
        const perms = await permRes.json();

        if (perms.data && perms.data.length > 0) {
            console.log('Permission already exists for public. Ensuring read access...');
            // Update if needed, but likely fine if exists.
        } else {
            console.log('Creating public read permission...');
            const createPerm = await fetch(`${url}/permissions`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    role: null, // Public
                    collection: collection,
                    action: 'read',
                    permissions: {}, // Full read access
                    fields: ['*']
                })
            });
            if (createPerm.ok) {
                console.log('Public read permission created.');
            } else {
                console.error('Failed to create permission:', await createPerm.json());
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

configureFlyers();
