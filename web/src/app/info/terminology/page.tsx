'use client';

import { useEffect, useState } from 'react';
import { directus, getAssetUrl } from '@/lib/directus';
import { readSingleton } from '@directus/sdk';
import styles from './terminology.module.css';
import Header from '@/components/Header';
import { ChevronRight } from '@/components/Icons'; // Assuming Icon availability
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BulletIcon = () => (
    <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.bulletIcon}>
        <circle cx="2.25" cy="2.25" r="2.25" fill="#171A22" />
    </svg>
);

export default function TerminologyPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await directus.request(readSingleton('terminology'));
                setData(result);
            } catch (error) {
                console.error('Error fetching terminology:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <main className={styles.main}>
                <Header title="Definición de Terminología" onBack={() => router.back()} showSearch={false} />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', width: '100%' }}>
                    <p style={{ color: '#908F9A' }}>Cargando...</p>
                </div>
            </main>
        );
    }

    if (!data) return null;

    return (
        <main className={styles.main}>
            {/* Header logic: User CSS implies a header. Converting to our Header component. */}
            <Header title="Definición de Terminología" onBack={() => router.back()} showSearch={false} />

            <div className={styles.introSection}>
                <h1 className={styles.introEyebrow}>{data.title}</h1>
                <div className={styles.introDescription} dangerouslySetInnerHTML={{ __html: data.description }} />
            </div>

            <div className={styles.contentContainer}>

                {/* Aromatherapy Card */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Aromaterapia</h2>
                    <div className={styles.cardContent}>
                        <div className={styles.imageWrapper}>
                            <div className={styles.imageGradient}></div>
                            {data.aromatherapy_image && (
                                <img
                                    src={getAssetUrl(data.aromatherapy_image)}
                                    alt="Aromaterapia"
                                    className={styles.realImage}
                                />
                            )}
                        </div>
                        <div className={styles.cardText} dangerouslySetInnerHTML={{ __html: data.aromatherapy_description }} />

                        <Link href="/info/usage_modes" className={styles.actionButton}>
                            <span className={styles.actionButtonText}>Ver modos de empleo</span>
                        </Link>
                    </div>
                </div>

                {/* Hydrotherapy Card */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Hidroterapia</h2>
                    <div className={styles.cardContent}>
                        <div className={styles.imageWrapper}>
                            <div className={styles.imageGradient}></div>
                            {data.hydrotherapy_image && (
                                <img
                                    src={getAssetUrl(data.hydrotherapy_image)}
                                    alt="Hidroterapia"
                                    className={styles.realImage}
                                />
                            )}
                        </div>

                        <div className={styles.separator}></div>

                        <div className={styles.cardText} dangerouslySetInnerHTML={{ __html: data.hydrotherapy_description }} />

                        <div className={styles.effectsContainer}>
                            {/* Rendering bullets from JSON list */}
                            {data.hydrotherapy_effects_bullets && Array.isArray(data.hydrotherapy_effects_bullets) && (
                                data.hydrotherapy_effects_bullets.map((item: any, index: number) => (
                                    <div key={index} className={styles.effectRow}>
                                        <BulletIcon />
                                        <p className={styles.effectsText}>
                                            {/* Handle both string items (legacy) and object items (new repeater) */}
                                            {typeof item === 'string' ? item : item.effect}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
