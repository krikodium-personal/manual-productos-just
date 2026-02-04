'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { readItems } from '@directus/sdk';
import { directus } from '../lib/directus';
import { ChevronRight } from './Icons';
import styles from '../app/page.module.css';

interface Category {
    id: number;
    name: string;
    parent: number | null;
    children: Category[];
    sort?: number; // Add sort field
}

export default function ProductFamily() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIds, setOpenIds] = useState<number[]>([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                // Fetch all categories
                const result = await directus.request(readItems('categories', {
                    fields: ['id', 'name', 'parent', 'sort'], // Include sort field
                    limit: -1,
                    sort: ['sort'] // Request backend sort
                }));

                // Build Tree
                const nodes: Record<number, Category> = {};
                const roots: Category[] = [];

                // 1. Initialize nodes
                result.forEach((item: any) => {
                    nodes[item.id] = {
                        id: item.id,
                        name: item.name,
                        parent: item.parent,
                        sort: item.sort,
                        children: []
                    };
                });

                // 2. Link parents
                // @ts-ignore
                result.forEach(item => {
                    if (item.parent) {
                        const parentId = typeof item.parent === 'object' ? item.parent.id : item.parent;
                        if (nodes[parentId]) {
                            nodes[parentId].children.push(nodes[item.id]);
                        }
                    } else {
                        roots.push(nodes[item.id]);
                    }
                });

                // Client-side Sort (Backup) based on 'sort' field
                const sortByOrder = (a: Category, b: Category) => (a.sort || 0) - (b.sort || 0);

                roots.sort(sortByOrder);
                roots.forEach(root => root.children.sort(sortByOrder));

                setCategories(roots);

                // Auto-open the first one if it exists
                if (roots.length > 0) {
                    setOpenIds([roots[0].id]);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    const toggle = (id: number) => {
        setOpenIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    if (loading) return <div className={styles.cardWrapper}>Cargando...</div>;

    return (
        <div className={styles.cardWrapper}>
            {categories.map((cat, index) => {
                const isOpen = openIds.includes(cat.id);
                const isLast = index === categories.length - 1;
                const hasChildren = cat.children && cat.children.length > 0;

                // Wrapper for the header part
                const HeaderContent = () => (
                    <>
                        <span className={styles.categoryTitle}>{cat.name}</span>
                        {hasChildren && (
                            <div className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                                <ChevronRight />
                            </div>
                        )}
                    </>
                );

                return (
                    <div key={cat.id} className={!isLast ? styles.accordionItemBorder : ''}>
                        {hasChildren ? (
                            <button
                                className={styles.accordionHeaderButton}
                                onClick={() => toggle(cat.id)}
                            >
                                <HeaderContent />
                            </button>
                        ) : (
                            <Link
                                href={`/category/${cat.id}`}
                                className={styles.accordionHeaderButton}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <HeaderContent />
                            </Link>
                        )}

                        {isOpen && hasChildren && (
                            <div className={styles.accordionContent}>
                                {cat.children.map(child => (
                                    <Link
                                        key={child.id}
                                        href={`/category/${child.id}`}
                                        className={styles.listItem}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <span className={styles.listLabel}>{child.name}</span>
                                        <div className={styles.chevronList}>
                                            <ChevronRight />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
