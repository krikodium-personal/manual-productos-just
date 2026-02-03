import { createDirectus, rest, readFieldsByCollection, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function listFields() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        const fields = await client.request(readFieldsByCollection('products'));
        console.log('--- Product Fields ---');
        fields.forEach(f => {
            console.log(`- ${f.field} (${f.type})`);
        });
    } catch (error) {
        console.error('Error listing fields:', error);
    }
}

listFields();
