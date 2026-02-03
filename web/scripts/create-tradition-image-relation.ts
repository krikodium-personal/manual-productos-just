import { createDirectus, rest, createRelation, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function createRel() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Creating relation for products.tradition_image -> directus_files...");

        await client.request(createRelation({
            collection: 'products',
            field: 'tradition_image',
            related_collection: 'directus_files',
            schema: {
                on_delete: 'SET NULL'
            },
            meta: {
                many_collection: 'products',
                many_field: 'tradition_image',
                one_collection: 'directus_files',
                one_field: null,
                one_collection_field: null,
                one_allowed_collections: null,
                junction_field: null,
                sort_field: null,
                one_deselect_action: 'nullify'
            }
        }));

        console.log("Success: Relation created.");

    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.errors) console.error(JSON.stringify(error.errors, null, 2));
    }
}

createRel();
