'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './vital_just.module.css';

interface VitalJustSubLine {
    text: string;
}

interface VitalJustData {
    hero_title: string;
    hero_description: string;
    hero_image?: string;

    line_1_title: string;
    line_1_products: VitalJustSubLine[];

    line_2_title: string;
    line_2_products: VitalJustSubLine[];

    line_3_title: string;
    line_3_products: VitalJustSubLine[];
}

export default function VitalJustPage() {
    const router = useRouter();
    const [data, setData] = useState<VitalJustData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                let fetchedData: any = null;
                try {
                    // Fetch as singleton (auto returns object if configured, or list of 1)
                    // With singleton: true, the endpoint is /items/vital_just_content (object)
                    // But via SDK readItems it might still be an array if using readItems? 
                    // Let's safe-check result format.
                    // Actually, for Singleton collections we often use readSingleton if available or just readItems.
                    // If it returns an object directly, we handle it.
                    const result = await directus.request(readItems('vital_just_content', {
                        fields: ['*']
                    }));

                    // Directus SDK usually returns array for readItems even if singleton? 
                    // Or readSingleton() should be used. Using readItems usually works but returns array or object depending on config.
                    // If singleton, Directus API returns the object directly at /items/collection.
                    // The SDK 'readItems' might wrap it? Let's assume result might be object or array[0].
                    if (Array.isArray(result)) {
                        fetchedData = result[0];
                    } else {
                        fetchedData = result;
                    }

                } catch (e) {
                    console.warn("CMS fetch failed, using fallback", e);
                }

                if (fetchedData && fetchedData.hero_title) {
                    setData({
                        hero_title: fetchedData.hero_title,
                        hero_description: fetchedData.hero_description,
                        hero_image: fetchedData.hero_image,
                        line_1_title: fetchedData.line_1_title,
                        line_1_products: fetchedData.line_1_products || [],
                        line_2_title: fetchedData.line_2_title,
                        line_2_products: fetchedData.line_2_products || [],
                        line_3_title: fetchedData.line_3_title,
                        line_3_products: fetchedData.line_3_products || []
                    });
                } else {
                    // MOCK DATA
                    setData({
                        hero_title: "Vital Just",
                        hero_description: "Vital Just se divide en 3 líneas de cuidado para abordar las diferentes necesidades de la piel sin distinguir edad sino tipo y estado de la piel. El objetivo primordial se basa en proteger, hidratar y reparar el daño cutáneo.",
                        hero_image: "",
                        line_1_title: "Cuidado Básico de limpieza: limpia, tonifica y repara la capa hidrolipídica de la piel.",
                        line_1_products: [
                            { text: "Gel Limpiador Facial con Rosa de Provenza y Edelweiss" },
                            { text: "Desmaquillante Micelar con Rosa Damascena y Edelweiss" },
                            { text: "Tónico Clarificante con Rosa Damascena y Edelweiss" },
                            { text: "Crema Micro-Exfoliante con Rosa de Provenza y Edelweiss" }
                        ],
                        line_2_title: "Cuidado Anti-Age para pieles que presentan las primeras señales del envejecimiento: líneas de expresión, arrugas y pérdida de la firmeza.",
                        line_2_products: [
                            { text: "Crema Hidratante de Día con Edelweiss y Campanilla de Primavera" },
                            { text: "Crema Redensificadora de Noche con Edelweiss y Crocus" },
                            { text: "Hidro Gel Matificante con Edelweiss y Moambe Amarillo" },
                            { text: "Mascarilla de Renovación Intensiva con Edelweiss y Rosa Negra" }
                        ],
                        line_3_title: "Cuidado de Pieles Maduras que necesitan recuperar su firmeza, contorno y luminosidad.",
                        line_3_products: [
                            { text: "Serum Reparador con Edelweiss y Alga de la Nieve" },
                            { text: "Crema para el Contorno de Ojos y Labios con Edelweiss y Alga de la Nieve" },
                            { text: "Crema de Hidratación Profunda Día & Noche con Edelweiss y Alga de la Nieve" }
                        ]
                    });
                }

            } catch (err) {
                console.error("Error:", err);
                setError("Hubo un error al cargar el contenido.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const getImageUrl = (imageId?: string) => {
        if (!imageId) return null;
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-4078.up.railway.app';
        return `${baseUrl}/assets/${imageId}`;
    };

    // Construct lines array for rendering loop from fixed fields
    const renderLines = () => {
        if (!data) return [];
        return [
            { title: data.line_1_title, products: data.line_1_products },
            { title: data.line_2_title, products: data.line_2_products },
            { title: data.line_3_title, products: data.line_3_products }
        ];
    };

    return (
        <div className={styles.main}>
            <Header
                title="Vital Just"
                onBack={() => router.back()}
                showSearch={false}
                showShare={false}
            />

            <div className={styles.heroImageContainer}>
                {data?.hero_image && (
                    <img
                        src={getImageUrl(data.hero_image)!}
                        alt="Vital Just Hero"
                        className={styles.heroImage}
                    />
                )}
            </div>

            <div className={styles.content}>
                {loading && <div className={styles.loading}>Cargando...</div>}

                {!loading && data && (
                    <>
                        <div className={styles.introSection}>
                            <h1 className={styles.title}>{data.hero_title}</h1>
                            <p className={styles.description}>{data.hero_description}</p>
                        </div>

                        <div className={styles.calculatorContainer}>
                            <button
                                className={styles.calculatorButton}
                                onClick={() => router.push('/info/vital_just_flyers')}
                            >
                                <span className={styles.calculatorButtonText}>Descargar flyers Vital Just</span>
                            </button>
                        </div>

                        <div className={styles.linesHeader}>
                            <div className={styles.dividerLine}></div>
                            <div className={styles.linesLabelContainer}>
                                <span className={styles.linesNumber}>3</span>
                                <span className={styles.linesText}>LÍNEAS DE CUIDADO</span>
                            </div>
                            <div className={styles.dividerLine}></div>
                        </div>

                        {renderLines().map((line, index) => (
                            <div key={index} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.badge}>
                                        <span className={styles.badgeNumber}>{index + 1}</span>
                                    </div>
                                    <h3 className={styles.cardTitle}>{line.title}</h3>
                                </div>
                                <div className={styles.cardBody}>
                                    {(line.products || []).map((prod, idx) => (
                                        <div key={idx} className={styles.listItem}>
                                            <div className={styles.itemContainer}>
                                                <div className={styles.iconWrapper}>
                                                    <div className={styles.bullet}></div>
                                                </div>
                                                <span className={styles.itemText}>{prod.text}</span>
                                            </div>
                                            {idx < (line.products || []).length - 1 && (
                                                <div className={styles.itemDivider}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
