'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './faq.module.css';
import { ChevronDown } from '@/components/Icons';

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

export default function FAQPage() {
    const router = useRouter();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const items = await directus.request(readItems('faq', {
                    fields: ['*'],
                    sort: ['id']
                }));

                console.log('FAQ Data:', items);
                setFaqs(items as FAQ[]);
            } catch (err) {
                console.error("Error fetching FAQs:", err);
                // Check if it's a permission error
                if (err instanceof Error && err.message.includes('403')) {
                    setError("Access denied. Please check permissions.");
                } else {
                    setError("Hubo un error al cargar las preguntas frecuentes.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const toggleItem = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const formatNumber = (index: number) => {
        return `${index + 1}.`;
    };

    return (
        <div className={styles.main}>
            <Header
                title="Preguntas frecuentes"
                onBack={() => router.back()}
                showSearch={false}
                showShare={false}
            />

            <div className={styles.content}>

                {/* Section Label matches "Preguntas frecuentes DE AROMATERAPIA" style */}
                <span className={styles.sectionLabel}>PREGUNTAS FRECUENTES DE AROMATERAPIA</span>

                {loading && <div className={styles.loading}>Cargando...</div>}
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.faqList}>
                    {!loading && !error && faqs.map((item, index) => {
                        const isOpen = expandedIds.includes(item.id);
                        return (
                            <div
                                key={item.id}
                                className={styles.accordionItem}
                                onClick={() => toggleItem(item.id)}
                            >
                                <div className={styles.accordionHeader}>
                                    <div className={styles.headerContent}>
                                        <span className={styles.number}>{formatNumber(index)}</span>
                                        <h3 className={styles.question}>{item.question}</h3>
                                    </div>
                                    <div className={`${styles.chevron} ${isOpen ? styles.open : ''}`}>
                                        <ChevronDown color="#5AAFF1" />
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className={styles.answerContainer}>
                                        <p className={styles.answer}>{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
