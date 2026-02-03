
import { createDirectus, rest, readRelations, authentication, updateRelation, createRelation } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Reading relations for 'product_markets'...");
        const relations = await client.request(readRelations());

        // Find relation where Many Side is product_markets.product_id
        const targetRel = relations.find((r: any) =>
            r.collection === 'product_markets' && r.field === 'product_id'
        );

        if (!targetRel) {
            console.log('Relation product_markets.product_id NOT FOUND. Creating it...');

            try {
                await client.request(createRelation({
                    collection: 'product_markets',
                    field: 'product_id',
                    related_collection: 'products',
                    schema: {
                        // We assume FK exists in DB, but we tell Directus about it.
                        // If we pass null schema, it might just be metadata-only?
                        // Let's try standard definition.
                        foreign_key_table: 'products',
                        foreign_key_column: 'id',
                        on_delete: 'SET NULL'
                    },
                    meta: {
                        one_field: 'markets',
                        sort_field: null,
                        one_deselect_action: 'nullify',
                        one_allowed_collections: null,
                        one_collection_field: null,
                        junction_field: null
                    }
                }));
                console.log('Relation Created Successfully.');
            } catch (e: any) {
                console.log('Error creating relation:', e.message);
                // Schema conflict?
            }
        } else {
            // ... existing update logic ...
            console.log('Relation found. Checking meta...');
            if (targetRel.related_collection === 'products' && targetRel.meta?.one_field !== 'markets') {
                console.log(`Fixing relation: Setting one_field to 'markets' (was ${targetRel.meta?.one_field})`);
                await client.request(updateRelation('product_markets', 'product_id', {
                    meta: {
                        ...targetRel.meta,
                        one_field: 'markets'
                    }
                }));
                console.log('Relation fixed.');
            } else {
                console.log('Relation is already correct (one_field is "markets").');
            }
        }

        // Also check market_variants -> product_markets -> variants
        // Re-read relations to pick up changes or safe check
        const relations2 = await client.request(readRelations());
        const variantsRel = relations2.find((r: any) =>
            r.collection === 'market_variants' && r.field === 'market_id'
        );

        if (!variantsRel) {
            console.log('Relation market_variants.market_id NOT FOUND. Creating it...');
            try {
                await client.request(createRelation({
                    collection: 'market_variants',
                    field: 'market_id',
                    related_collection: 'product_markets',
                    schema: {
                        foreign_key_table: 'product_markets',
                        foreign_key_column: 'id',
                        on_delete: 'CASCADE'
                    },
                    meta: {
                        one_field: 'variants'
                    }
                }));
                console.log('Variants Relation Created.');
            } catch (e: any) {
                console.log('Error creating variants relation:', e.message);
            }
        } else if (variantsRel.meta?.one_field !== 'variants') {
            console.log(`Fixing variants relation: Setting one_field to 'variants'`);
            await client.request(updateRelation('market_variants', 'market_id', {
                meta: {
                    ...variantsRel.meta,
                    one_field: 'variants'
                }
            }));
            console.log('Variants relation fixed.');
        }


    } catch (error) {
        console.error('Error:', error);
    }
}

main();
