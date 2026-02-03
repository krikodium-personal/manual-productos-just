import { createDirectus, rest, readPermissions, createPermission, updatePermission, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function grant() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        // 1. Find existing permission for Public + Products + Read
        const existing = await client.request(readPermissions({
            filter: {
                role: { _null: true },
                collection: { _eq: 'products' },
                action: { _eq: 'read' }
            }
        }));

        if (existing.length > 0) {
            const permId = existing[0].id;
            console.log(`Updating existing permission ${permId}...`);
            await client.request(updatePermission(permId, {
                fields: ['*']
            }));
            console.log('Updated to [*]');
        } else {
            console.log('Creating new permission...');
            await client.request(createPermission({
                role: null,
                collection: 'products',
                action: 'read',
                fields: ['*']
            }));
            console.log('Created permission [*]');
        }

    } catch (e: any) {
        console.error('Error:', e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

grant();
