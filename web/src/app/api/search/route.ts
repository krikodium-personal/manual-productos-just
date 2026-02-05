import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // 'products', 'needs', or 'all'
    const country = searchParams.get('country');

    console.log('[Search API] Query:', query, 'Type:', type, 'Country:', country);

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ results: [] });
    }

    // Helper for accent-insensitive comparison
    const normalize = (text: string) =>
        text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

    const term = normalize(query);

    try {
        let allResults: any[] = [];

        // Search products if type is 'products' or 'all'
        if (type === 'products' || type === 'all') {
            try {
                // Fetch ALL products (lightweight fields) and filter in memory
                const productFilter: any = {};
                if (country) {
                    productFilter.markets = { country_id: { _eq: country } };
                }

                const products = await directus.request(readItems('products', {
                    filter: productFilter,
                    fields: ['id', 'name', 'slug', 'photo', 'description_short', 'product_code', 'description_long'],
                    limit: -1, // Fetch all to filter locally
                }));

                const filteredProducts = products.filter((p: any) => {
                    return normalize(p.name).includes(term) ||
                        normalize(p.description_short).includes(term) ||
                        normalize(p.description_long).includes(term) ||
                        normalize(p.product_code).includes(term);
                }).slice(0, 5); // Limit after filter

                console.log('[Search API] Found products:', filteredProducts.length);
                allResults = [...allResults, ...filteredProducts.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    photo: p.photo,
                    short_description: p.description_short, // Map to common field
                    type: 'product'
                }))];
            } catch (prodError) {
                console.error('[Search API] Error searching products:', prodError);
            }
        }

        // Search needs if type is 'needs' or 'all'
        if (type === 'needs' || type === 'all') {
            try {
                const needs = await directus.request(readItems('needs', {
                    fields: ['id', 'name', 'short_description', 'slug'],
                    limit: -1
                }));

                const filteredNeeds = needs.filter((n: any) => {
                    return normalize(n.name).includes(term) ||
                        normalize(n.short_description).includes(term);
                }).slice(0, 5);

                console.log('[Search API] Found needs:', filteredNeeds.length);
                allResults = [...allResults, ...filteredNeeds.map((n: any) => ({ ...n, type: 'need' }))];
            } catch (needError) {
                console.error('[Search API] Error searching needs:', needError);
            }
        }

        // Search ingredients if type is 'ingredients' or 'all'
        if (type === 'ingredients' || type === 'all') {
            try {
                const ingredients = await directus.request(readItems('ingredients', {
                    fields: ['id', 'name', 'photo', 'slug'],
                    limit: -1
                }));

                const filteredIngredients = ingredients.filter((i: any) => {
                    return normalize(i.name).includes(term);
                }).slice(0, 5);

                console.log('[Search API] Found ingredients:', filteredIngredients.length);
                allResults = [...allResults, ...filteredIngredients.map((i: any) => ({ ...i, type: 'ingredient' }))];
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
