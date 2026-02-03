'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './usage_modes.module.css';

interface UsageMode {
    id: string;
    title: string;
    description: string;
    photo?: string;
    default_drops?: number;
    is_aromatherapy?: boolean;
}

export default function UsageModesPage() {
    const router = useRouter();
    const [usageModes, setUsageModes] = useState<UsageMode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch usage modes
                // Corrected schema: id, title, photo, description, default_drops, is_aromatherapy
                // Removed 'sort' from sort array as it doesn't exist
                const items = await directus.request(readItems('usage_modes', {
                    fields: ['*'],
                    sort: ['id'] // using id as fallback sort
                }));

                console.log('Usage Modes Data:', items);
                // Filter by is_aromatherapy
                const filteredItems = items.filter((item: any) => item.is_aromatherapy === true);
                setUsageModes(filteredItems as any[]);
            } catch (err) {
                console.error("Error fetching usage modes:", err);
                setError("Hubo un error al cargar los modos de empleo.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className={styles.main}>
            <Header
                title="Modos de empleo"
                onBack={() => router.back()}
                showSearch={false}
                showShare={false}
            />

            <div className={styles.content}>

                {/* Section Label */}
                <span className={styles.sectionLabel}>MODOS DE EMPLEO DE AROMATERAPIA</span>

                {loading && <div className={styles.loading}>Cargando...</div>}
                {error && <div className={styles.error}>{error}</div>}

                {!loading && !error && usageModes.map((mode) => (
                    <div key={mode.id} className={styles.card}>
                        <div className={styles.cardInner}>
                            <img
                                src={
                                    mode.photo ? `${directusUrl}/assets/${mode.photo}` :
                                        '/placeholder_usage.png'
                                }
                                alt={mode.title}
                                className={styles.cardImage}
                                onError={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ddd';
                                }}
                            />

                            <div className={styles.textContainer}>
                                <div className={styles.textContent}>
                                    <h3 className={styles.cardTitle}>{mode.title}</h3>
                                    <p className={styles.cardDescription}>{mode.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
