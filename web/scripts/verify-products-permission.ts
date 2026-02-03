import { createDirectus, rest, readPermissions, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function check() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        // Get all permissions
        const permissions = await client.request(readPermissions({
            filter: {
                role: { _null: true }, // Public role
                collection: { _eq: 'products' },
                action: { _eq: 'read' }
            }
        }));

        if (permissions.length === 0) {
            console.log('No public read permission for products!');
        } else {
            const p = permissions[0];
            console.log('Public Read Permission fields:', p.fields);
            if (p.fields && (p.fields.includes('*') || p.fields.length === 0)) { // Empty list sometimes implies none, but * implies all
                console.log('Access looks OPEN (wildcard or unset).');
            } else {
                console.log('Access is RESTRICTED to specific fields.');
            }
        }

    } catch (e) {
        console.error(e);
    }
}

check();
