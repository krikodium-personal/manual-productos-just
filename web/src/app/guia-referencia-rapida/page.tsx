'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readItems } from '@directus/sdk';
import { directus } from '@/lib/directus';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import { ChevronRight } from '@/components/Icons';
import styles from './page.module.css';

interface Need {
    id: string;
    slug: string;
    name: string;
    short_description?: string;
}

export default function GuiaReferenciaRapida() {
    const [needs, setNeeds] = useState<Need[]>([]);
    const [filteredNeeds, setFilteredNeeds] = useState<Need[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNeeds() {
            try {
                // Fetch all needs ordered by name
                const result = await directus.request(readItems('needs', {
                    fields: ['id', 'name', 'short_description', 'slug'],
                    sort: ['name'],
                    limit: -1
                }));
                // Cast to Need[]
                const data = (result as any[]) || [];
                setNeeds(data);
                setFilteredNeeds(data);
            } catch (error: any) {
                console.error("Error fetching needs:", error);
                // The 403 error is handled by the empty list check in JSX
            } finally {
                setLoading(false);
            }
        }
        fetchNeeds();
    }, []);

    useEffect(() => {
        const filtered = needs.filter(need =>
            need.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredNeeds(filtered);
    }, [searchTerm, needs]);

    // Grouping logic
    const groupedNeeds = filteredNeeds.reduce((groups, need) => {
        const letter = need.name.charAt(0).toUpperCase();
        if (!groups[letter]) {
            groups[letter] = [];
        }
        groups[letter].push(need);
        return groups;
    }, {} as Record<string, Need[]>);

    const sortedLetters = Object.keys(groupedNeeds).sort();

    return (
        <main className={styles.guidePage}>
            <Header
                title="Guía de Referencia Rápida"
                onBack={() => window.history.back()}
                showSearch={false}
            >
                <SearchBar type="needs" placeholder="Buscar Necesidad..." className={styles.searchBar} />
            </Header>

            <div className={styles.scrollContent}>
                <div className={styles.heroSection}>
                    <div className={styles.guideImageContainer}>
                        <img
                            src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800"
                            alt="Guía de Referencia Rápida"
                            className={styles.guideImage}
                        />
                    </div>

                    <div className={styles.guideIntro}>
                        <h2 className={styles.guideTitle}>Sobre la Guía de Referencia</h2>
                        <p className={styles.guideDescription}>
                            Utiliza la siguiente guía a fin de encontrar el producto Just que mejor se adapte a las necesidades específicas de tu cliente.
                        </p>
                    </div>
                </div>

                <div className={styles.listSection}>
                    <h3 className={styles.sectionLabel}>NECESIDADES</h3>

                    {loading ? (
                        <div className={styles.loading}>Cargando necesidades...</div>
                    ) : filteredNeeds.length === 0 ? (
                        <div className={styles.emptyState}>No se encontraron necesidades para "{searchTerm}"</div>
                    ) : (
                        <div className={styles.cardsContainer}>
                            <div className={styles.needCard}>
                                {sortedLetters.map((letter, letterIdx) => (
                                    <div key={letter}>
                                        <div className={styles.letterRow}>{letter}</div>
                                        <div className={styles.needsList}>
                                            {groupedNeeds[letter].map((need, idx) => {
                                                const isLastInLetter = idx === groupedNeeds[letter].length - 1;
                                                const isLastLetter = letterIdx === sortedLetters.length - 1;
                                                return (
                                                    <Link
                                                        key={need.id}
                                                        href={`/info/needs/${need.slug || need.id}`}
                                                        className={`${styles.needItem} ${(isLastInLetter && isLastLetter) ? styles.lastItem : ''}`}
                                                    >
                                                        <span className={styles.needName}>{need.name}</span>
                                                        <ChevronRight className={styles.chevron} />
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.disclaimer}>
                        *El uso de los productos recomendados no reemplaza bajo ningún punto de vista el asesoramiento médico profesional para diagnosticar, aliviar o tratar problemas o condiciones médicas.
                    </div>
                </div>
            </div>
        </main >
    );
}
