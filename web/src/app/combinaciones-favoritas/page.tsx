'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { directus, getAssetUrl } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './combinaciones.module.css';

interface Product {
    id: number;
    name: string;
    photo: string;
    slug: string;
}

interface Combination {
    id: number;
    name: string;
    description: string;
    image: string;
    recipe: string;
    products: {
        products_id: Product;
    }[];
}

export default function CombinacionesFavoritasPage() {
    const router = useRouter();
    const [combinations, setCombinations] = useState<Combination[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        async function fetchCombinations() {
            try {
                const result = await directus.request(readItems('favorite_combinations', {
                    fields: ['*', 'products.products_id.*']
                }));
                // @ts-ignore
                setCombinations(result);
            } catch (error) {
                console.error("Error fetching combinations:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchCombinations();
    }, []);

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const getSafeClassName = (name: string) => {
        return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    };

    if (loading) {
        return (
            <main className={styles.main}>
                <Header title="Vehiculares Aromablends" onBack={() => router.back()} showSearch={false} />
                <div className={styles.body} style={{ justifyContent: 'center', height: '50vh', alignItems: 'center' }}>
                    <p style={{ color: '#908F9A' }}>Cargando...</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <Header
                title="Vehiculares Aromablends"
                onBack={() => router.back()}
                showSearch={false}
            />

            <div className={styles.body}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Combinaciones favoritas</h1>
                    <p className={styles.pageDescription}>
                        Descubre nuestras sugerencias para crear tus propias sinergias de aromaterapia utilizando los Vehiculares Aromablends.
                    </p>
                </div>

                <div className={styles.combinationsContainer}>
                    {combinations.map((comb) => {
                        const isExpanded = expandedIds.has(comb.id);
                        const safeName = getSafeClassName(comb.name);

                        return (
                            <div
                                key={comb.id}
                                className={`${styles.combinationCard} ${styles[`card_${safeName}`] || ''}`}
                                onClick={() => toggleExpand(comb.id)}
                                style={{ height: isExpanded ? 'auto' : '140px' }}
                            >
                                <div className={styles.combinationHeader}>
                                    <div className={styles.emojiWrapper}>
                                        {comb.image ? (
                                            <img
                                                src={getAssetUrl(comb.image)}
                                                alt={comb.name}
                                                className={styles.emojiImage}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '40px' }}>✨</span>
                                        )}
                                    </div>
                                    <div className={styles.textWrapper}>
                                        <span className={styles.eyebrow}>{comb.name}</span>
                                        <p className={styles.description}>{comb.description}</p>
                                    </div>
                                    <div className={`${styles.chevronWrapper} ${isExpanded ? styles.chevronRotated : ''}`}>
                                        <svg width="13" height="7" viewBox="0 0 13 7" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.chevronIcon}>
                                            <path d="M6.32487 5.14194L11.2249 0.241935C11.3915 0.0752688 11.5888 -0.00528679 11.8165 0.00026878C12.0443 0.00582435 12.2415 0.0919355 12.4082 0.258602C12.5749 0.425269 12.6582 0.622491 12.6582 0.850269C12.6582 1.07805 12.5749 1.27527 12.4082 1.44194L7.27487 6.5586C7.14154 6.69194 6.99154 6.79194 6.82487 6.8586C6.6582 6.92527 6.49154 6.9586 6.32487 6.9586C6.1582 6.9586 5.99154 6.92527 5.82487 6.8586C5.6582 6.79194 5.5082 6.69194 5.37487 6.5586L0.241536 1.42527C0.0748691 1.2586 -0.00568681 1.06416 -0.000131644 0.841935C0.00542447 0.619713 0.0915355 0.425268 0.258203 0.258602C0.42487 0.091935 0.622092 0.00860162 0.84987 0.00860163C1.07765 0.00860164 1.27487 0.091935 1.44154 0.258602L6.32487 5.14194Z" fill="#5AAFF1" />
                                        </svg>
                                    </div>
                                </div>

                                <div className={`${styles.expandedContent} ${isExpanded ? styles.expandedContentVisible : ''}`}>
                                    <div className={styles.productsList}>
                                        {comb.products?.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={styles.productItem}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (item.products_id?.slug) {
                                                        router.push(`/products/${item.products_id.slug}`);
                                                    }
                                                }}
                                            >
                                                <div className={styles.productImageWrapper}>
                                                    {item.products_id?.photo ? (
                                                        <img
                                                            src={getAssetUrl(item.products_id.photo)}
                                                            alt={item.products_id.name}
                                                            className={styles.productImage}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: '10px', color: '#CCC' }}>IMG</span>
                                                    )}
                                                </div>
                                                <div className={styles.productInfo}>
                                                    <h3 className={styles.productTitle}>{item.products_id?.name || 'Producto'}</h3>
                                                    <span className={styles.productArt}>ART: 10{item.products_id?.id}</span>
                                                </div>
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M6 12L10 8L6 4" stroke="#5AAFF1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
