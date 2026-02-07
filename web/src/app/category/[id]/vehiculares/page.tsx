'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readItems } from '@directus/sdk';
import { directus, getAssetUrl } from '@/lib/directus';
import Header from '@/components/Header';
import { ChevronRight } from '@/components/Icons';
import styles from './vehiculares.module.css';
import { useCountry } from '@/context/CountryContext';
import Link from 'next/link';

interface Advantage {
    id: number;
    text: string;
}

interface VehicularContent {
    id: number;
    title: string;
    description: string;
    advantages_title: string;
    advantages: Advantage[];
}

interface Product {
    id: string;
    name: string;
    photo: string;
    product_code?: string;
    slug?: string;
}

const TriangleIcon = () => (
    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 11.35V1C0 0.716667 0.1 0.479167 0.3 0.2875C0.5 0.0958333 0.733333 0 1 0C1.08333 0 1.17083 0.0125 1.2625 0.0375C1.35417 0.0625 1.44167 0.1 1.525 0.15L9.675 5.325C9.825 5.425 9.9375 5.55 10.0125 5.7C10.0875 5.85 10.125 6.00833 10.125 6.175C10.125 6.34167 10.0875 6.5 10.0125 6.65C9.9375 6.8 9.825 6.925 9.675 7.025L1.525 12.2C1.44167 12.25 1.35417 12.2875 1.2625 12.3125C1.17083 12.3375 1.08333 12.35 1 12.35C0.733333 12.35 0.5 12.2542 0.3 12.0625C0.1 11.8708 0 11.6333 0 11.35Z" fill="#456ECE" />
    </svg>
);

export default function VehicularesPage() {
    const router = useRouter();
    const { selectedCountry } = useCountry();
    const [content, setContent] = useState<VehicularContent | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedCountry) return;

        async function fetchData() {
            try {
                // Fetch content and advantages
                const contentResult = await directus.request(readItems('vehiculares', {
                    fields: ['*', 'advantages.*'],
                    limit: 1
                }));

                // Fetch products for category 7 (Vehiculares)
                // Filter by country availability (variants.prices.market)
                const productsResult = await directus.request(readItems('products', {
                    filter: {
                        _and: [
                            { category: { _eq: 7 } },
                            { variants: { prices: { market: { _eq: selectedCountry!.id } } } }
                        ]
                    },
                    fields: ['id', 'name', 'photo', 'product_code', 'slug'],
                    sort: ['id']
                }));

                if (contentResult) {
                    // @ts-ignore
                    const rawContent = Array.isArray(contentResult) ? contentResult[0] : contentResult;

                    if (rawContent) {
                        setContent({
                            ...rawContent,
                            advantages: (rawContent.advantages || []) as unknown as Advantage[]
                        } as VehicularContent);
                    }
                }

                setProducts(productsResult as unknown as Product[]);
            } catch (error) {
                console.error("Error fetching vehicular data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedCountry]);

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

    if (!content) {
        return (
            <main className={styles.main}>
                <Header title="Vehiculares Aromablends" onBack={() => router.back()} showSearch={false} />
                <div className={styles.body} style={{ justifyContent: 'center', height: '50vh', alignItems: 'center' }}>
                    <p style={{ color: '#908F9A' }}>Contenido no encontrado.</p>
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
                <div className={styles.contentSection}>
                    <div className={styles.titleAndSubtitle}>
                        <h1 className={styles.pageTitle}>{content.title}</h1>
                        <p className={styles.mainDescription}>{content.description}</p>
                    </div>

                    <div className={styles.productList}>
                        {products.map(product => (
                            <Link href={`/products/${product.slug || product.id}`} key={product.id} className={styles.productItem}>
                                <div className={styles.productImageContainer}>
                                    <div className={styles.productImageWrapper}>
                                        {product.photo ? (
                                            <img
                                                src={getAssetUrl(product.photo, { width: 120, height: 120, fit: 'cover', quality: 80 })}
                                                alt={product.name}
                                                className={styles.productImage}
                                            />
                                        ) : (
                                            <div style={{ color: '#CCC', fontSize: '10px' }}>IMG</div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.productInfo}>
                                    <h3 className={styles.productTitle}>{product.name}</h3>
                                    <span className={styles.productArt}>ART: {product.product_code || product.id}</span>
                                </div>
                                <div className={styles.chevronContainer}>
                                    <ChevronRight />
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className={styles.calculatorButtonWrapper}>
                        <Link href="/combinaciones-favoritas" className={styles.calculatorButton}>
                            <span className={styles.calculatorButtonText}>Combinaciones favoritas</span>
                        </Link>
                    </div>

                    <h2 className={styles.advantagesTitle}>{content.advantages_title}</h2>

                    <div className={styles.advantagesSection}>
                        {content.advantages.map(advantage => (
                            <div key={advantage.id} className={styles.advantageItem}>
                                <div className={styles.advantageIcon}>
                                    <TriangleIcon />
                                </div>
                                <p className={styles.advantageText}>{advantage.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
