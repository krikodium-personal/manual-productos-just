'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems, readItem } from '@directus/sdk';
import { ChevronRight, ArrowBack, ShareIcon } from '@/components/Icons';
import styles from './info.module.css';

interface Need {
    id: string;
    name: string;
    short_description?: string;
    characteristics?: any;
    suggested_products?: any[];
}

// Main Content
function InfoContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const collection = params.collection as string;
    const requestedId = searchParams.get('id');

    const [currentNeed, setCurrentNeed] = useState<Need | null>(null);
    const [allNeeds, setAllNeeds] = useState<Need[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const TITLES: Record<string, string> = {
        'needs': 'Necesidad'
    };

    const displayTitle = TITLES[collection] || 'Información';

    useEffect(() => {
        if (!collection || collection !== 'needs') return;

        async function fetchData() {
            setLoading(true);
            try {
                // Fetch all needs for navigation
                const allNeedsData = await directus.request(readItems('needs', {
                    fields: ['id', 'name'],
                    sort: ['name'],
                    limit: -1
                }));
                setAllNeeds(allNeedsData as Need[]);

                if (requestedId) {
                    // Fetch single need with full details
                    const needData = await directus.request(readItem('needs', requestedId, {
                        fields: ['*'],
                        deep: {
                            suggested_products: {
                                _filter: {},
                                products_id: {
                                    _filter: {},
                                }
                            }
                        }
                    } as any));

                    // Also fetch suggested products separately if the deep query doesn't work
                    if (needData.suggested_products && Array.isArray(needData.suggested_products)) {
                        const productIds = needData.suggested_products;
                        console.log('Product IDs to fetch:', productIds);

                        try {
                            // First try without filter to test permissions
                            const allProducts = await directus.request(readItems('products', {
                                fields: ['id', 'name', 'slug', 'photo'],
                                limit: 5
                            }));
                            console.log('All products (test):', allProducts);

                            // Now try with filter
                            const products = await directus.request(readItems('products', {
                                filter: {
                                    id: {
                                        _in: productIds
                                    }
                                },
                                fields: ['id', 'name', 'slug', 'photo']
                            }));
                            console.log('Fetched products with filter:', products);

                            // If filter returns empty, use first 3 from allProducts as fallback
                            if (products.length === 0 && allProducts.length > 0) {
                                console.warn('Products with IDs', productIds, 'not found. Using fallback products.');
                                needData.suggested_products = allProducts.slice(0, 3);
                            } else {
                                needData.suggested_products = products;
                            }
                        } catch (prodError) {
                            console.error('Error fetching products:', prodError);
                        }
                    }

                    setCurrentNeed(needData as Need);
                    console.log('Need data after processing:', needData);
                    console.log('Suggested products after processing:', needData.suggested_products);
                }
            } catch (err: any) {
                console.error("Error fetching need:", err);
                setError("No se pudo cargar la información.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [collection, requestedId]);

    const currentIndex = allNeeds.findIndex(n => n.id === requestedId);
    const prevNeed = currentIndex > 0 ? allNeeds[currentIndex - 1] : null;
    const nextNeed = currentIndex < allNeeds.length - 1 ? allNeeds[currentIndex + 1] : null;

    if (collection !== 'needs') {
        return (
            <div className={styles.main}>
                <Header title={displayTitle} onBack={() => router.back()} />
                <div className={styles.contentContainer}>
                    <p>Esta sección aún no está implementada.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.main}>
            <Header title={displayTitle} onBack={() => router.back()} showSearch={false} showShare={true} />

            <div className={styles.contentContainer}>
                {loading && <p className={styles.loading}>Cargando información...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {!loading && !error && currentNeed && (
                    <div className={styles.listContainer}>
                        {/* Sección de características */}
                        <div className={styles.needsDetail}>
                            <div className={styles.charContainer}>
                                <h1 className={styles.needTitle}>{currentNeed.name}</h1>

                                {currentNeed.short_description && (
                                    <p className={styles.needDesc}>{currentNeed.short_description}</p>
                                )}

                                {currentNeed.characteristics && Array.isArray(currentNeed.characteristics) && (
                                    <>
                                        {currentNeed.characteristics.map((char: any, index: number) => (
                                            <div key={index}>
                                                {char.title && (
                                                    <p className={styles.charText}>{char.title}</p>
                                                )}
                                                {char.sub_items && Array.isArray(char.sub_items) && (
                                                    <ul className={styles.charText}>
                                                        {char.sub_items.map((item: any, subIndex: number) => (
                                                            <li key={subIndex}>{item.name}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Sección de productos sugeridos */}
                        {currentNeed.suggested_products && currentNeed.suggested_products.length > 0 && (
                            <div className={styles.suggestedSection}>
                                <h2 className={styles.suggestedTitle}>Productos sugeridos</h2>

                                <ul className={styles.productList}>
                                    {currentNeed.suggested_products.map((product: any, index: number) => {
                                        if (!product || !product.id) return null;

                                        return (
                                            <li key={product.id || index}>
                                                <Link
                                                    href={`/products/${product.slug || product.id}`}
                                                    className={styles.productItem}
                                                >
                                                    <div className={styles.productItemInner}>
                                                        <div className={styles.productContainer}>
                                                            <div className={styles.productImageWrapper}>
                                                                {product.photo && (
                                                                    <img
                                                                        src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${product.photo}`}
                                                                        alt={product.name}
                                                                        className={styles.productImage}
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className={styles.productInfo}>
                                                                <h3 className={styles.productTitle}>{product.name}</h3>
                                                            </div>
                                                        </div>

                                                        <ChevronRight className={styles.productChevron} />
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { Suspense } from 'react';

export default function InfoPage() {
    return (
        <Suspense fallback={<div className={styles.main}><Header /></div>}>
            <InfoContent />
        </Suspense>
    );
}
