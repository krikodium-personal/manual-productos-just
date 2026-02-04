'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { readItem, readItems } from '@directus/sdk';
import { directus, getAssetUrl } from '@/lib/directus';
import Header from '@/components/Header';
import { ChevronRight } from '@/components/Icons';
import styles from './category.module.css';
import Link from 'next/link';

// Helper Icon for Accordion (Chevron Down - matches design)
const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6L8 10L12 6" stroke="#171A22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface Product {
    id: string;
    name: string;
    photo: string;
    category?: string | number;
    product_code?: string;
    slug?: string;
}

interface Category {
    id: string;
    name: string;
    description?: string;
    parent?: string | number | null; // Add parent
    products?: Product[];
    children?: Category[];
}

// Main Content
function CategoryContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const expandedId = searchParams?.get('expanded');

    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [openSubcategories, setOpenSubcategories] = useState<string[]>([]);

    useEffect(() => {
        if (!id) return;

        async function fetchData() {
            try {
                // 1. Fetch Category Basic Info to check Parent
                const categoryResult = await directus.request(readItem('categories', id, {
                    fields: [
                        'id',
                        'name',
                        'description', // Fetch description
                        'parent',
                        'children.id', 'children.name', 'children.sort'
                    ],
                    deep: {
                        children: {
                            _sort: ['sort']
                        }
                    }
                }));

                // Check Redirection logic
                if (String(categoryResult.id) === '7') {
                    router.replace(`/category/1/vehiculares`);
                    return;
                }
                if (categoryResult.parent) {
                    if (String(categoryResult.id) === '7') {
                        router.replace(`/category/${categoryResult.parent}/vehiculares`);
                    } else {
                        console.log(`Subcategory detected (Parent: ${categoryResult.parent}). Redirecting...`);
                        router.replace(`/category/${categoryResult.parent}?expanded=${id}`);
                    }
                    return; // Stop execution here
                }

                // 2. Fetch Products
                const childrenIds = categoryResult.children ? categoryResult.children.map((c: any) => c.id) : [];
                const allIds = [id, ...childrenIds];

                const productsResult = await directus.request(readItems('products', {
                    filter: {
                        category: {
                            _in: allIds
                        }
                    },
                    fields: ['id', 'name', 'photo', 'category', 'product_code', 'slug']
                }));

                console.log("Fetched Structure:", categoryResult);
                if (categoryResult.children) {
                    console.log("Children Sort Values:", categoryResult.children.map((c: any) => `${c.name}: ${c.sort}`));
                }

                const fullCategory: Category = {
                    id: String(categoryResult.id),
                    name: categoryResult.name,
                    description: categoryResult.description, // Map description (requires interface update if undefined)
                    parent: categoryResult.parent,
                    products: productsResult.filter((p: any) => p.category == id) as unknown as Product[],
                    children: categoryResult.children ? categoryResult.children
                        .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0)) // Explicit Client-Side Sort
                        .map((child: any) => ({
                            id: String(child.id),
                            name: child.name,
                            products: productsResult.filter((p: any) => p.category == child.id) as unknown as Product[]
                        })) : []
                };

                setCategory(fullCategory);

                // Auto-open logic
                // If 'expanded' param is present, open strictly that one (or added to all?)
                // User said: "con el desplegable expandido de la subcategoria seleccionada"
                // Let's prioritize the 'expanded' ID if present, otherwise default behavior (open all or none).
                // Existing code was "Auto-open all".

                if (expandedId) {
                    setOpenSubcategories([expandedId]);
                } else if (fullCategory.children && fullCategory.children.length > 0) {
                    // Default: Open all? Or keep closed? 
                    // User previously saw "structure" which implies seeing the list.
                    // The design mockup usually shows Accordions closed or one open. 
                    // Let's Open ALL by default based on previous success, unless user complains.
                    // It makes "structure" visible immediately.
                    setOpenSubcategories(fullCategory.children.map(c => c.id));
                }

            } catch (error) {
                console.error("Error fetching category:", error);
                // If error, stop loading
                setLoading(false);
            } finally {
                // Only stop loading if we didn't redirect (technically redirect unmounts, but safe to set false)
                // If categoryResult.parent was true, we returned, so this finally block might run?
                // Actually if we return, finally runs. 
                // But we want to avoid showing content if redirecting. 
                // We logic handles it by 'if (categoryResult.parent) return' inside try.
                // The 'setLoading(false)' in finally will run. 
                // So UI might flash "Category not found" or "Loading" briefly.
                // Let's control setLoading carefully.
                if (!loading) return; // Already handled?
                setLoading(false);
            }
        }

        fetchData();
    }, [id, router, expandedId]); // Add deps

    const toggleSubcategory = (subId: string) => {
        setOpenSubcategories(prev =>
            prev.includes(subId) ? prev.filter(i => i !== subId) : [...prev, subId]
        );
    };

    if (loading) return (
        <main className={styles.main}>
            <Header />
            <div className={styles.contentContainer} style={{ justifyContent: 'center', height: '50vh', display: 'flex', alignItems: 'center' }}>
                <p style={{ color: '#908F9A', fontSize: '14px' }}>Cargando...</p>
            </div>
        </main>
    );

    if (!category) return (
        <main className={styles.main}>
            <Header />
            <div className={styles.contentContainer} style={{ justifyContent: 'center', height: '50vh', display: 'flex', alignItems: 'center' }}>
                <p style={{ color: '#908F9A', fontSize: '14px' }}>Categoría no encontrada.</p>
            </div>
        </main>
    );

    const hasDirectProducts = category.products && category.products.length > 0;
    const hasSubcategories = category.children && category.children.length > 0;

    return (
        <main className={styles.main}>
            <Header
                title={category.name}
                onBack={() => router.back()}
            />

            <div className={styles.contentContainer}>
                {/* Category Description */}
                {category.description && (
                    <p className={styles.categoryDescription}>{category.description}</p>
                )}

                <div className={styles.subcategoriesContainer}>

                    {/* 1. Direct Products List */}
                    {hasDirectProducts && (
                        <div className={styles.productList}>
                            {category.products!.map(product => (
                                <Link href={`/products/${product.slug || product.id}`} key={product.id} className={styles.productItem}>
                                    <div className={styles.productImageContainer}>
                                        {product.photo ? (
                                            <img
                                                src={getAssetUrl(product.photo, { width: 120, height: 120, fit: 'cover', quality: 80 })}
                                                alt={product.name}
                                                className={styles.productImage}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: '#F5F5F5' }} />
                                        )}
                                    </div>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productName}>{product.name}</span>
                                        <div className={styles.productMeta}>
                                            <span className={styles.productCode}>{product.product_code || `A-${product.id}`}</span>
                                        </div>
                                    </div>
                                    <div className={styles.chevronRight}>
                                        <ChevronRight />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* 2. Subcategories Accordions */}
                    {hasSubcategories ? (
                        category.children!.map(sub => {
                            const isOpen = openSubcategories.includes(sub.id);

                            if (sub.id === '7') {
                                return (
                                    <Link key={sub.id} href={`/category/${id}/vehiculares`} className={styles.accordionHeader} style={{ textDecoration: 'none' }}>
                                        <div className={styles.accordionHeaderContent}>
                                            <span className={styles.accordionTitle}>{sub.name} ({sub.products?.length || 0})</span>
                                            <div className={styles.chevron}>
                                                <ChevronRight />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <div key={sub.id} className={styles.accordionItem}>
                                    <button
                                        className={styles.accordionHeader}
                                        onClick={() => toggleSubcategory(sub.id)}
                                    >
                                        <div className={styles.accordionHeaderContent}>
                                            <span className={styles.accordionTitle}>{sub.name} ({sub.products?.length || 0})</span>
                                            <div className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                                                <ChevronDown />
                                            </div>
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className={styles.productList}>
                                            {sub.products && sub.products.length > 0 ? (
                                                sub.products.map(product => (
                                                    <Link href={`/products/${product.slug || product.id}`} key={product.id} className={styles.productItem}>
                                                        <div className={styles.productImageContainer}>
                                                            {product.photo ? (
                                                                <img
                                                                    src={getAssetUrl(product.photo, { width: 120, height: 120, fit: 'cover', quality: 80 })}
                                                                    alt={product.name}
                                                                    className={styles.productImage}
                                                                />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', background: '#F5F5F5' }} />
                                                            )}
                                                        </div>
                                                        <div className={styles.productInfo}>
                                                            <span className={styles.productName}>{product.name}</span>
                                                            <div className={styles.productMeta}>
                                                                <span className={styles.productCode}>{product.product_code || `A-${product.id}`}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.chevronRight}>
                                                            <ChevronRight />
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div style={{
                                                    padding: '16px 4px',
                                                    color: '#908F9A',
                                                    fontSize: '14px',
                                                    fontFamily: 'Museo Sans'
                                                }}>
                                                    No hay productos en esta subcategoría.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        // Fallback only if truly no structure
                        !hasDirectProducts && (
                            <div style={{
                                textAlign: 'center',
                                color: '#908F9A',
                                marginTop: '40px',
                                fontFamily: 'Museo Sans',
                                fontSize: '14px'
                            }}>
                                No hay productos ni subcategorías.
                            </div>
                        )
                    )}
                </div>
            </div>
        </main>
    );
}

// Default export with Suspense
import React, { Suspense } from 'react';

export default function CategoryPage() {
    return (
        <Suspense fallback={<div className={styles.main}><Header /></div>}>
            <CategoryContent />
        </Suspense>
    );
}
