
const DIRECTUS_URL = 'http://localhost:8055';
const EMAIL = 'admin@example.com';
const PASSWORD = 'password';

async function run() {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const data = await res.json();
    const token = data.data.access_token;
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const imageFields = [
        { col: 'products', field: 'photo' },
        { col: 'ingredients', field: 'photo' },
        { col: 'usage_modes', field: 'photo' },
        { col: 'terminology', field: 'photo' },
        { col: 'attributes', field: 'icon' },
        { col: 'vital_just_content', field: 'intro_photo' },
        { col: 'vital_just_tips', field: 'photo' },
        { col: 'vital_just_flyers', field: 'photo' },
        { col: 'vital_just_flyers', field: 'file' }
    ];

    for (const item of imageFields) {
        console.log(`Creating relation for ${item.col}.${item.field} -> directus_files`);

        // Create Relation
        const response = await fetch(`${DIRECTUS_URL}/relations`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                collection: item.col,
                field: item.field,
                related_collection: 'directus_files',
                schema: {
                    onDelete: 'SET NULL'    // Standard for files
                }
            })
        });

        const txt = await response.text();
        if (response.status === 200 || response.status === 204) {
            console.log('Success.');
        } else {
            if (txt.includes('already exists') || txt.includes('RECORD_NOT_UNIQUE')) {
                console.log('Relation already exists (Skipping).');
            } else {
                console.error('Failed:', txt);
            }
        }
    }
}

run();
