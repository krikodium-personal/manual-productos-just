'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './vital_just_flyers.module.css';
import { PdfIcon } from '@/components/Icons';

interface Flyer {
    id: number;
    title: string;
    description?: string;
    image?: string; // UUID
    file?: string;  // UUID
}

export default function VitalJustFlyersPage() {
    const router = useRouter();
    const [flyers, setFlyers] = useState<Flyer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

    useEffect(() => {
        async function fetchFlyers() {
            try {
                const result = await directus.request(readItems('vital_just_flyers', {
                    fields: ['*'],
                    sort: ['id'] // Or sort by title?
                }));
                console.log("Flyers data received:", result);
                setFlyers(result as Flyer[]);
            } catch (err) {
                console.error("Error fetching flyers:", err);
                setError("Hubo un error al cargar los flyers.");
            } finally {
                setLoading(false);
            }
        }

        fetchFlyers();
    }, []);

    console.log("Rendering Flyers Page. State:", { loading, error, flyersCount: flyers.length });

    const handleDownload = (fileId: string | undefined) => {
        if (!fileId) return;
        // Open file in new tab. Directus assets URL: /assets/<id>
        // We might want to force download? ?download
        const url = `${directusUrl}/assets/${fileId}?download`;
        window.open(url, '_blank');
    };

    return (
        <div className={styles.main}>
            {/* Header Title: "Flyers Vital Just" based on request context, or "Tips Vital" style? 
                User req: "Flyers Vital Just" collection. 
                CSS mentions "Nueva línea Vital Just" as subtitle.
                Let's use "Flyers Vital Just" for header.
            */}
            <Header
                title="Flyers Vital Just"
                onBack={() => router.back()}
                showSearch={false}
                showShare={false}
            />

            <div className={styles.content}>

                <p className={styles.introText}>
                    Descarga y comparte con tus clientes los flyers para presentar los productos de la línea Vital Just
                </p>

                {loading && <div className={styles.loading}>Cargando...</div>}
                {error && <div className={styles.error}>{error}</div>}

                {!loading && !error && flyers.map((flyer) => (
                    <div key={flyer.id} className={styles.card}>

                        {/* Image */}
                        <div className={styles.cardImageContainer}>
                            {flyer.image ? (
                                <img
                                    src={`${directusUrl}/assets/${flyer.image}`}
                                    alt={flyer.title}
                                    className={styles.cardImage}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <span>Sin imagen</span>
                                </div>
                            )}
                        </div>

                        {/* Texts */}
                        <div className={styles.textContainer}>
                            <h3 className={styles.cardTitle}>{flyer.title}</h3>
                            {flyer.description && (
                                <p className={styles.cardDescription}>{flyer.description}</p>
                            )}
                        </div>

                        {/* Button */}
                        <a
                            className={styles.downloadButton}
                            href={flyer.file ? `${directusUrl}/assets/${flyer.file}?download` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                if (!flyer.file) e.preventDefault();
                            }}
                        >
                            <PdfIcon />
                            <span>Descargar flyer en PDF</span>
                        </a>

                    </div>
                ))}

            </div>
        </div>
    );
}
