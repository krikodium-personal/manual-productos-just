'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './aromatherapy_tips.module.css';
import { StarIcon } from '@/components/Icons';

interface Tip {
    id: number;
    description: string;
    photo?: string;
}

export default function AromatherapyTipsPage() {
    const router = useRouter();
    const [tips, setTips] = useState<Tip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

    useEffect(() => {
        async function fetchData() {
            try {
                const items = await directus.request(readItems('aromatherapy_tips', {
                    fields: ['*'],
                    sort: ['id']
                }));

                console.log('Tips Data:', items);
                setTips(items as Tip[]);
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
            {/* Header with Title "Tips Aroma" matching the collection rename */}
            <Header
                title="Tips de demostración"
                onBack={() => router.back()}
                showSearch={false}
                showShare={false}
            />

            <div className={styles.content}>

                {/* Section Label */}
                <span className={styles.sectionLabel}>TIPS DE DEMOSTRACIÓN DE AROMATERAPIA</span>

                {loading && <div className={styles.loading}>Cargando...</div>}
                {error && <div className={styles.error}>{error}</div>}

                {!loading && !error && tips.map((tip) => (
                    <div key={tip.id} className={styles.itemContainer}>

                        {/* Image Indented Left */}
                        <div className={styles.photoContainer}>
                            {tip.photo ? (
                                <img
                                    src={`${directusUrl}/assets/${tip.photo}`}
                                    alt="Tip demo"
                                    className={styles.tipImage}
                                />
                            ) : (
                                <div className={styles.tipImage} style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    Sin imagen
                                </div>
                            )}
                        </div>

                        {/* Icon + Text Row */}
                        <div className={styles.textContainerRow}>
                            <div className={styles.iconWrapper}>
                                <StarIcon />
                            </div>
                            <div className={styles.textWrapper}>
                                <p className={styles.description}>{tip.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
