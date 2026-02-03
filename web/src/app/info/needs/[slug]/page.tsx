'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { ChevronRight } from '@/components/Icons';
import styles from '../../[collection]/info.module.css';

interface Need {
    id: string;
    slug: string;
    name: string;
    short_description?: string;
    characteristics?: any;
    suggested_products?: any[];
}

export default function NeedDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();

    const [currentNeed, setCurrentNeed] = useState<Need | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        async function fetchData() {
            setLoading(true);
            try {
                // Fetch need by slug
                const result = await directus.request(readItems('needs', {
                    filter: {
                        slug: { _eq: slug }
                    },
                    fields: [
                        '*',
                        'suggested_products.product_id.id',
                        'suggested_products.product_id.name',
                        'suggested_products.product_id.slug',
                        'suggested_products.product_id.photo'
                    ],
                    limit: 1
                }));

                if (result && result.length > 0) {
                    const needData = result[0] as any;

                    // Flatten suggested products if needed (depending on schema)
                    if (needData.suggested_products && Array.isArray(needData.suggested_products)) {
                        needData.suggested_products = needData.suggested_products
                            .map((p: any) => p.product_id)
                            .filter(Boolean);
                    }

                    setCurrentNeed(needData as Need);
                } else {
                    setError("No se encontró la necesidad solicitada.");
                }
            } catch (err: any) {
                console.error("Error fetching need:", err);
                setError("No se pudo cargar la información.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [slug]);

    return (
        <div className={styles.main}>
            <Header
                title={currentNeed?.name || "Necesidad"}
                onBack={() => router.back()}
                showSearch={false}
                showShare={true}
            />

            <div className={styles.contentContainer}>
                {loading && <p className={styles.loading}>Cargando información...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {!loading && !error && currentNeed && (
                    <div className={styles.listContainer}>
                        {/* Detail Section */}
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

                        {/* Suggested Products Section */}
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
