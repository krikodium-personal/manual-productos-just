'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './vital_just_tips.module.css';
import { StarIcon } from '@/components/Icons'; // Reusing StarIcon? Or maybe a different one? Aroma used Star. Let's stick generic for now unless specified.

interface SubDescription {
    text: string;
}

interface Tip {
    id: number;
    title?: string;
    description: string;
    photo?: string;
    sub_descriptions?: SubDescription[];
    is_highlighted_section?: boolean;
}

export default function VitalJustTipsPage() {
    const router = useRouter();
    const [tips, setTips] = useState<Tip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch Tips List (now includes highlighted sections)
                const tipsResult = await directus.request(readItems('vital_just_tips', {
                    fields: ['*'],
                    sort: ['id'] // User can reorder manually in CMS to place Double Cleanse at bottom
                }));

                const safeTips = (tipsResult || []).map((item: any) => ({
                    ...item,
                    sub_descriptions: item.sub_descriptions || []
                }));
                setTips(safeTips);

            } catch (err) {
                console.error("Error fetching tips:", err);
                setError("Hubo un error al cargar los tips.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className={styles.main}>
            <Header
                title="Tips demostración Vital Just"
                onBack={() => router.back()}
                showSearch={false}
                showShare={false}
            />

            <div className={styles.content}>

                <span className={styles.sectionLabel}>TIPS DE DEMOSTRACION VITAL JUST</span>

                {loading && <div className={styles.loading}>Cargando...</div>}
                {error && <div className={styles.error}>{error}</div>}

                {!loading && !error && tips.map((tip, index) => {
                    const nextTip = tips[index + 1];
                    // Show divider if:
                    // 1. Not the last item overall AND
                    // 2. Not a highlighted section itself AND
                    // 3. Next item is NOT a highlighted section (per user req: no line before DC)
                    // If current is standard, and next is DC, NO line.
                    const showDivider = !tip.is_highlighted_section && nextTip && !nextTip.is_highlighted_section;

                    return (
                        <div key={tip.id}>
                            {/* CONDITIONAL RENDERING BASED ON FLAG */}
                            {tip.is_highlighted_section ? (
                                // DOUBLE CLEANSE LAYOUT
                                <div className={styles.doubleCleanseSection}>

                                    {tip.title && (
                                        <h2 className={styles.doubleCleanseTitle}>{tip.title}</h2>
                                    )}

                                    <div className={styles.photoContainer}>
                                        {tip.photo ? (
                                            <img
                                                src={`${directusUrl}/assets/${tip.photo}`}
                                                alt={tip.title || "Double Cleanse"}
                                                className={styles.tipImage}
                                            />
                                        ) : (
                                            <div className={styles.placeholderImage}><span>Sin imagen</span></div>
                                        )}
                                    </div>

                                    <div className={styles.doubleCleanseItems}>
                                        {(tip.sub_descriptions || []).map((sub, idx) => (
                                            <div key={idx} className={styles.textContainerRow}>
                                                <div className={styles.iconWrapper}>
                                                    <StarIcon />
                                                </div>
                                                <div className={styles.textWrapper}>
                                                    <p className={styles.description}>{sub.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                // STANDARD TIP LAYOUT
                                <div className={styles.itemContainer}>
                                    <div className={styles.photoContainer}>
                                        {tip.photo ? (
                                            <img
                                                src={`${directusUrl}/assets/${tip.photo}`}
                                                alt="Tip visual"
                                                className={styles.tipImage}
                                            />
                                        ) : (
                                            <div className={styles.placeholderImage}><span>Sin imagen</span></div>
                                        )}
                                    </div>

                                    <div className={styles.textContainerRow}>
                                        <div className={styles.iconWrapper}>
                                            <StarIcon />
                                        </div>
                                        <div className={styles.textWrapper}>
                                            <p className={styles.description}>{tip.description}</p>

                                            {tip.sub_descriptions && tip.sub_descriptions.length > 0 && (
                                                <div className={styles.subDescriptions}>
                                                    {tip.sub_descriptions.map((sub, idx) => (
                                                        <div key={idx} className={styles.bulletItem}>
                                                            <div className={styles.bulletDot}></div>
                                                            <span className={styles.bulletText}>{sub.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* SEPARATOR LINE */}
                                    {showDivider && <div className={styles.divider}></div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
