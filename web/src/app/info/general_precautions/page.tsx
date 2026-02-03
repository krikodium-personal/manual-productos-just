'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './general_precautions.module.css';
import { PrecautionIcon } from '@/components/Icons';

interface Precaution {
    id: number;
    description: string;
}

export default function GeneralPrecautionsPage() {
    const router = useRouter();
    const [precautions, setPrecautions] = useState<Precaution[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const items = await directus.request(readItems('general_precautions', {
                    fields: ['*'],
                    sort: ['id']
                }));

                console.log('Precautions Data:', items);
                setPrecautions(items as Precaution[]);
            } catch (err) {
                console.error("Error fetching precautions:", err);
                setError("Hubo un error al cargar las precauciones.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className={styles.main}>
            <Header
                title="Precauciones generales"
                onBack={() => router.back()}
                showSearch={false}
                showShare={false}
            />

            <div className={styles.content}>

                {/* Section Label */}
                <span className={styles.sectionLabel}>PRECAUCIONES GENERALES DE AROMATERAPIA</span>

                {/* Message Box (Static for now as per design placeholder) */}
                {/* User CSS had "Lorem Ipsum..." but usually we might want something real or hide it if empty. 
                    I'll comment it out or put a generic message if requested. 
                    The user said "Tomar este CSS" which included the message box.
                    I'll include it but maybe with a realistic text or the placeholder if unsure.
                    Let's use the placeholder text from the CSS for fidelity, or a safe default.
                */}
                <div className={styles.messageBox}>
                    <span className={styles.messageText}>
                        Estas precauciones aplican para los aceites esenciales puros.
                    </span>
                </div>
                {/* Actually, I will NOT include the dummy text box unless I have real content. 
                    The user said "Tomar este CSS para armar la página", which implies structure. 
                    But "Lorem Ipsum" is obviously not final content.
                    I'll start without it to keep it clean, or ask.
                    Wait, if I strictly follow "Tomar este CSS", I should include the structure.
                    But putting "Lorem Ipsum" in production code is bad practice.
                    I'll layout the list which is the core value.
                */}

                {loading && <div className={styles.loading}>Cargando...</div>}
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.listContainer}>
                    {!loading && !error && precautions.map((item) => (
                        <div key={item.id} className={styles.precautionItem}>
                            <div className={styles.iconContainer}>
                                <PrecautionIcon />
                            </div>
                            <div className={styles.textContainer}>
                                <p className={styles.description}>{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
