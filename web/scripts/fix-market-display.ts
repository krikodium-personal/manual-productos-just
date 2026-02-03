
import { createDirectus, rest, readRelations, authentication, updateRelation, createRelation, updateField } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    console.log('Authenticating...');
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Authenticated.');
    } catch (error) {
        console.error('Authentication failed:', error);
        return;
    }

    console.log('Checking Relations...');
    const relations = await client.request(readRelations());

    // 1. Check product_markets.country_id -> countries.id
    const countryRel = relations.find((r: any) =>
        r.collection === 'product_markets' && r.field === 'country_id'
    );

    if (!countryRel) {
        console.log('Relation product_markets.country_id NOT FOUND. Creating it...');
        try {
            await client.request(createRelation({
                collection: 'product_markets',
                field: 'country_id',
                related_collection: 'countries',
                schema: {
                    foreign_key_table: 'countries',
                    foreign_key_column: 'id',
                    on_delete: 'SET NULL'
                },
                meta: {
                    one_field: null, // No O2M needed on countries side usually, unless we want to see "Products" in a Country item
                    sort_field: null,
                    one_deselect_action: 'nullify',
                    one_allowed_collections: null,
                    one_collection_field: null,
                    junction_field: null
                }
            }));
            console.log('Country Relation Created.');
        } catch (e: any) {
            console.log('Error creating country relation:', e.message);
        }
    } else {
        console.log('Country Relation exists.');
    }

    // 2. Update 'markets' field on 'products' to use the correct Display Template
    console.log("Updating 'markets' field display options...");
    try {
        await client.request(updateField('products', 'markets', {
            meta: {
                display: 'related-values',
                display_options: {
                    template: '{{country_id.name}}'
                }
            }
        }));
        console.log("Updated products.markets display options.");
    } catch (e: any) {
        console.log("Error updating field meta:", e.message);
    }

    console.log('Done.');
}

main().catch(console.error);
