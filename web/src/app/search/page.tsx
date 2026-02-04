'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './search.module.css';
import {
    ChevronRight,
    SearchIcon,
    CloseIcon,
    InfoIcon
} from '@/components/Icons';
import { directus, getAssetUrl } from '@/lib/directus';
import { readItems } from '@directus/sdk';

// Types
interface VariantPrice {
    price: number;
    variant_id: {
        id: number;
        capacity_value: number;
        capacity_unit: string;
    };
}

interface ProductMarket {
    id: number;
    country_id: number;
    prices: VariantPrice[];
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description?: string;
    description_short?: string;
    description_long?: string;
    product_code?: string;
    markets: ProductMarket[];
    attributes?: any[];
    needs?: any[];
    ingredients?: any[];
}

// Main Content
function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'needs' | 'ingredients'>('products');

    const pathname = usePathname();

    // Sync search term with URL query parameter
    useEffect(() => {
        const handler = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchTerm) {
                params.set('q', searchTerm);
            } else {
                params.delete('q');
            }

            const query = params.toString();
            const url = query ? `${pathname}?${query}` : pathname;

            // Using replace to avoid clogging back button history for every character
            router.replace(url, { scroll: false });
        }, 500); // 500ms debounce

        return () => clearTimeout(handler);
    }, [searchTerm, pathname, router, searchParams]);

    // Fetch Products
    useEffect(() => {
        async function fetchProducts() {
            try {
                const results = await directus.request(readItems('products', {
                    limit: -1,
                    fields: [
                        'id',
                        'name',
                        'slug',
                        'photo',
                        'product_code',
                        'description',
                        'description_short',
                        'description_long',
                        'markets.prices.price',
                        'markets.prices.variant_id.capacity_value',
                        'markets.prices.variant_id.capacity_unit',
                        'ingredients.ingredient_id.id',
                        'ingredients.ingredient_id.name',
                        'ingredients.ingredient_id.photo',
                        'attributes.attribute_id.id',
                        'attributes.attribute_id.name',
                        'attributes.attribute_id.icon',
                        'needs.need_id.id',
                        'needs.need_id.name',
                        'needs.need_id.slug',
                        'needs.need_id.short_description',
                        'needs.need_id.image',
                    ]
                }));
                // Filter out products that don't have show_calculator = true? 
                // For general search, maybe we want ALL products? 
                // The calculator only showed calculator products. The homepage search implies "Product Manual" search.
                // I will include ALL products for now as it seems safer for a general "Search" page.
                // If the user wants to limit it, I'll add the filter later.
                setProducts(results as unknown as Product[]);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }
        fetchProducts();
    }, []);

    // Derived State
    const filteredProducts = useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const term = searchTerm.toLowerCase();

        return products.filter(p => {
            const nameMatch = p.name ? p.name.toLowerCase().includes(term) : false;
            const descShortMatch = p.description_short ? p.description_short.toLowerCase().includes(term) : false;
            const descMatch = p.description ? p.description.toLowerCase().includes(term) : false;
            const descLongMatch = p.description_long ? p.description_long.toLowerCase().includes(term) : false;
            const codeMatch = p.product_code ? p.product_code.toLowerCase().includes(term) : false;

            return nameMatch || descShortMatch || descMatch || descLongMatch || codeMatch;
        });
    }, [searchTerm, products]);

    const filteredIngredients = useMemo(() => {
        if (!searchTerm || searchTerm.length < 3) return [];
        const term = searchTerm.toLowerCase();
        const ingredients = new Map();
        products.forEach(product => {
            product.ingredients?.forEach((ing: any) => {
                if (ing.ingredient_id && ing.ingredient_id.name && ing.ingredient_id.name.toLowerCase().includes(term)) {
                    ingredients.set(ing.ingredient_id.id, ing.ingredient_id);
                }
            });
        });
        return Array.from(ingredients.values());
    }, [searchTerm, products]);

    const filteredNeeds = useMemo(() => {
        if (!searchTerm || searchTerm.length < 3) return [];
        const term = searchTerm.toLowerCase();
        const needsMap = new Map();
        products.forEach(product => {
            const productMatches = product.name.toLowerCase().includes(term);
            product.needs?.forEach((n: any) => {
                const need = n.need_id;
                if (!need) return;

                const matchesName = need.name?.toLowerCase().includes(term);
                const matchesDesc = need.short_description?.toLowerCase().includes(term);

                if (matchesName || matchesDesc || productMatches) {
                    needsMap.set(need.id, need);
                }
            });
        });
        return Array.from(needsMap.values());
    }, [searchTerm, products]);

    // Handle Active Tab Selection
    useEffect(() => {
        if (filteredProducts.length > 0) setActiveTab('products');
        else if (filteredNeeds.length > 0) setActiveTab('needs');
        else if (filteredIngredients.length > 0) setActiveTab('ingredients');
    }, [searchTerm, products]);
    // Note: Use effect to switch tabs when search changes results

    const formatCurrency = (amount: number | string) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
    };

    const handleSelectProduct = (product: Product) => {
        router.push(`/products/${product.slug}`);
    };

    const handleSelectNeed = (need: any) => {
        router.push(`/info/needs/${need.slug || need.id}`);
    };

    return (
        <main className={styles.searchResultsPage}>
            <div className={styles.searchTopSection}>
                <div className={styles.resultsHeader}>
                    <Header title="Manual de Productos" onBack={() => router.back()} showSearch={false} />
                </div>

                <div className={styles.searchSection}>
                    <div className={styles.searchInputWrapper}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Buscar Producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    // Already in search view, maybe just blur inputs or standard behavior (list updates automatically)
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                        />
                        <div className={styles.searchIcon} onClick={() => { setSearchTerm(''); }}>
                            {searchTerm.length > 0 ? <CloseIcon /> : <SearchIcon />}
                        </div>
                    </div>

                    <div className={styles.hintContainer}>
                        <div className={styles.hintIcon}><InfoIcon /></div>
                        <div className={styles.hintText}>
                            Puedes buscar por nombre, necesidad y/o ingrediente.
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                <div
                    className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    Productos ({filteredProducts.length})
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'needs' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('needs')}
                >
                    Necesidades ({filteredNeeds.length})
                </div>
                <div
                    className={`${styles.tab} ${activeTab === 'ingredients' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('ingredients')}
                >
                    Ingredientes ({filteredIngredients.length})
                </div>
            </div>

            <div className={styles.resultsList}>
                <div className={styles.resultsCount}>
                    {(activeTab === 'products' ? filteredProducts.length :
                        activeTab === 'needs' ? filteredNeeds.length :
                            filteredIngredients.length)} RESULTADOS PARA TU BÚSQUEDA:
                </div>

                {(activeTab === 'products' ? filteredProducts :
                    activeTab === 'needs' ? filteredNeeds :
                        filteredIngredients).map((item: any) => (
                            <div key={item.id} className={styles.resultItem} onClick={() => {
                                if (activeTab === 'products') handleSelectProduct(item);
                                if (activeTab === 'needs') handleSelectNeed(item);
                                if (activeTab === 'ingredients') router.push(`/search?q=${encodeURIComponent(item.name)}`);
                            }}>
                                <div className={styles.resultImageContainer}>
                                    {(item.photo || item.icon || item.image) ? (
                                        <img
                                            src={getAssetUrl(item.photo || item.icon || item.image)}
                                            alt={item.name}
                                            className={`${styles.resultImage} ${activeTab === 'needs' ? styles.resultImageCover : ''}`}
                                        />
                                    ) : (
                                        <div style={{ color: '#908F9A', fontSize: '10px' }}>IMG</div>
                                    )}
                                </div>

                                <div className={styles.resultDetails}>
                                    <div className={styles.resultTitle}>{item.name}</div>
                                    <div className={styles.resultMetaRow}>
                                        <span className={`${styles.resultMetaText} ${activeTab === 'needs' ? styles.oneLineDescription : ''}`}>
                                            {activeTab === 'products' ? (item.product_code ? `ID: ${item.product_code}` : 'Producto Just') :
                                                activeTab === 'needs' ? (item.short_description || 'Bienestar y Salud') :
                                                    'Ingrediente Natural'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.chevronRight}>
                                    <ChevronRight />
                                </div>
                            </div>
                        ))}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <React.Suspense fallback={<div className={styles.searchResultsPage}><Header title="Buscando..." showSearch={false} /></div>}>
            <SearchContent />
        </React.Suspense>
    );
}
