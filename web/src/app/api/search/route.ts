import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // 'products', 'needs', or 'all'

    console.log('[Search API] Query:', query, 'Type:', type);

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        let allResults: any[] = [];

        // Search products if type is 'products' or 'all'
        if (type === 'products' || type === 'all') {
            try {
                console.log('[Search API] Searching products with query:', query);
                const products = await directus.request(readItems('products', {
                    filter: {
                        _or: [
                            { name: { _icontains: query } },
                            { description_short: { _icontains: query } },
                            { description_long: { _icontains: query } },
                            { product_code: { _icontains: query } }
                        ]
                    },
                    fields: ['id', 'name', 'slug', 'photo', 'description_short', 'product_code'],
                    limit: 5,
                    sort: ['name']
                }));

                console.log('[Search API] Products response:', JSON.stringify(products));
                console.log('[Search API] Found products:', products.length);
                allResults = [...allResults, ...products.map((p: any) => ({ ...p, type: 'product' }))];
            } catch (prodError) {
                console.error('[Search API] Error searching products:', prodError);
                console.error('[Search API] Error details:', JSON.stringify(prodError, null, 2));
            }
        }

        // Search needs if type is 'needs' or 'all'
        if (type === 'needs' || type === 'all') {
            try {
                const needs = await directus.request(readItems('needs', {
                    filter: {
                        _or: [
                            {
                                name: {
                                    _icontains: query
                                }
                            },
                            {
                                short_description: {
                                    _icontains: query
                                }
                            },
                            {
                                suggested_products: {
                                    product_id: {
                                        name: {
                                            _icontains: query
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    fields: ['id', 'name', 'short_description', 'slug'],
                    limit: 5,
                    sort: ['name']
                }));

                console.log('[Search API] Found needs:', needs.length);
                allResults = [...allResults, ...needs.map((n: any) => ({ ...n, type: 'need' }))];
            } catch (needError) {
                console.error('[Search API] Error searching needs:', needError);
            }
        }

        // Search ingredients if type is 'ingredients' or 'all'
        if (type === 'ingredients' || type === 'all') {
            try {
                const ingredients = await directus.request(readItems('ingredients', {
                    filter: {
                        name: {
                            _icontains: query
                        }
                    },
                    fields: ['id', 'name', 'photo'],
                    limit: 5,
                    sort: ['name']
                }));

                console.log('[Search API] Found ingredients:', ingredients.length);
                allResults = [...allResults, ...ingredients.map((i: any) => ({ ...i, type: 'ingredient' }))];
            } catch (ingError) {
                console.error('[Search API] Error searching ingredients:', ingError);
            }
        }

        console.log('[Search API] Total results:', allResults.length);
        return NextResponse.json({ results: allResults.slice(0, 10) });
    } catch (error) {
        console.error('[Search API] General error:', error);
        return NextResponse.json({ error: 'Search failed', details: String(error) }, { status: 500 });
    }
}
