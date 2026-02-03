import { createDirectus, rest, updateField, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function fixRelation() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log('Fixing FK relationship for tradition_image...');

        await client.request(updateField('products', 'tradition_image', {
            schema: {
                foreign_key_table: 'directus_files',
                foreign_key_column: 'id',
                on_delete: 'SET NULL'
            }
        }));

        console.log('Success: Updated tradition_image schema to link to directus_files.');

    } catch (e: any) {
        console.error('Error:', e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

fixRelation();
