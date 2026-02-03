import { createDirectus, rest, createPermission, readPermissions, updatePermission, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function grantAttributes() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        const collections = ['attributes', 'products_attributes'];

        for (const col of collections) {
            console.log(`Checking permissions for ${col}...`);

            const existing = await client.request(readPermissions({
                filter: {
                    role: { _null: true },
                    collection: { _eq: col },
                    action: { _eq: 'read' }
                }
            }));

            if (existing.length > 0) {
                console.log(`Permission exists for ${col}, updating to full access...`);
                await client.request(updatePermission(existing[0].id, {
                    fields: ['*']
                }));
            } else {
                console.log(`Creating permission for ${col}...`);
                await client.request(createPermission({
                    role: null,
                    collection: col,
                    action: 'read',
                    fields: ['*']
                }));
            }
        }

        console.log('Success: Public access granted to attributes collections.');

    } catch (e: any) {
        console.error('Error:', e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

grantAttributes();
