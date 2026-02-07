'use client';

import { useEffect, useState, use } from 'react';
import { directus, getAssetUrl } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './detail.module.css';
import Header from '@/components/Header';
import { ChevronRight } from '@/components/Icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function IngredientDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const [ingredient, setIngredient] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { slug } = use(params);

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Fetch Ingredient
                const isNumeric = /^\d+$/.test(slug);
                let filter: any = { slug: { _eq: slug } };

                if (isNumeric) {
                    filter = {
                        _or: [
                            { slug: { _eq: slug } },
                            { id: { _eq: parseInt(slug) } }
                        ]
                    };
                }

                const ingResult = await directus.request(readItems('ingredients', {
                    filter: filter,
                    limit: 1,
                    fields: ['*']
                }));

                if (Array.isArray(ingResult) && ingResult.length > 0) {
                    const ingData = ingResult[0];
                    setIngredient(ingData);

                    // 2. Fetch Related Products
                    // Assuming products_ingredients is the junction table
                    // We need products where ingredient_id = ingData.id
                    const prodResult = await directus.request(readItems('products_ingredients', {
                        filter: {
                            ingredient_id: { _eq: ingData.id }
                        },
                        fields: ['product_id.id', 'product_id.name', 'product_id.photo', 'product_id.slug'] // Fetch product details
                    }));

                    if (Array.isArray(prodResult)) {
                        // Extract product objects (some might be null if relation broken)
                        const products = prodResult
                            .map((item: any) => item.product_id)
                            .filter((p: any) => p);
                        setRelatedProducts(products);
                    }
                } else {
                    console.log('Ingredient not found');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        if (slug) {
            fetchData();
        }
    }, [slug]);

    if (loading) {
        return (
            <main className={styles.main}>
                <Header title="Ingrediente" onBack={() => router.back()} showSearch={false} />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', width: '100%' }}>
                    <p style={{ color: '#908F9A' }}>Cargando...</p>
                </div>
            </main>
        );
    }

    if (!ingredient) {
        return (
            <main className={styles.main}>
                <Header title="Ingrediente" onBack={() => router.back()} showSearch={false} />
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <p>No se encontró el ingrediente.</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            {/* Header logic: Title matches ingredient name or generic */}
            <Header title={ingredient.name} onBack={() => router.back()} showSearch={false} />

            {/* Hero Image */}
            <div className={styles.heroImageContainer}>
                {ingredient.photo && (
                    <img
                        src={getAssetUrl(ingredient.photo, { height: 600, quality: 85, fit: 'contain' })}
                        alt={ingredient.name}
                        className={styles.heroImage}
                    />
                )}
            </div>

            {/* Info Section */}
            <div className={styles.infoContainer}>
                <div className={styles.titleWrapper}>
                    <h1 className={styles.title}>{ingredient.name}</h1>
                </div>

                <div className={styles.descriptionWrapper}>
                    <div
                        className={styles.description}
                        dangerouslySetInnerHTML={{ __html: ingredient.description || ingredient.definition || '' }}
                    />

                    {/* CTA Button */}
                    <button
                        className={styles.ctaButton}
                        onClick={async () => {
                            const shareData = {
                                title: ingredient.name,
                                text: `¡Hola!\nTe comparto un ingrediente para que veas sus beneficios y conozcas los productos que lo contienen.\n\n${ingredient.name}\n${window.location.href}`,
                            };

                            try {
                                if (navigator.share) {
                                    await navigator.share(shareData);
                                } else {
                                    // Fallback for desktop/unsupported browsers: Copy to clipboard or alert
                                    console.log('Web Share API not supported', shareData);
                                    alert('La función de compartir no está soportada en este navegador. El enlace es: ' + window.location.href);
                                }
                            } catch (err) {
                                console.error('Error sharing:', err);
                            }
                        }}
                    >
                        <span className={styles.ctaText}>Compartir Ingrediente</span>
                    </button>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div id="products-section" className={styles.productsSection}>
                    <h2 className={styles.productsTitle}>Productos con este ingrediente</h2>

                    <div className={styles.productsList}>
                        {relatedProducts.map((product) => (
                            <Link
                                href={`/products/${product.slug || product.id}`} // Adjust route as needed
                                key={product.id}
                                className={styles.productItem}
                            >
                                <div className={styles.productImageWrapper}>
                                    {product.photo && (
                                        <img
                                            src={getAssetUrl(product.photo, { width: 120, height: 120, fit: 'cover', quality: 80 })}
                                            alt={product.name}
                                            className={styles.productImage}
                                        />
                                    )}
                                </div>
                                <div className={styles.productInfo}>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                </div>
                                <ChevronRight className={styles.chevronIcon} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
