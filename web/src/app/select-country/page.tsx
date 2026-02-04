'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { useCountry } from '@/context/CountryContext';
import { ChevronDown } from '@/components/Icons';
import { APP_VERSION } from '@/constants/version';
import styles from './select-country.module.css';

interface Country {
    id: string | number;
    name: string;
}

export default function SelectCountryPage() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [tempSelected, setTempSelected] = useState<Country | null>(null);
    const { selectCountry } = useCountry();
    const router = useRouter();

    useEffect(() => {
        async function fetchCountries() {
            try {
                const res = await directus.request(readItems('countries', {
                    fields: ['id', 'name', 'currency_symbol'],
                    sort: ['name']
                }));
                // @ts-ignore
                setCountries(res);
            } catch (err) {
                console.error("Error fetching countries:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCountries();
    }, []);

    const handleSelect = () => {
        if (tempSelected) {
            selectCountry(tempSelected);
            router.push('/');
        }
    };

    if (loading) {
        return (
            <div className={styles.main}>
                <p className={styles.loading}>Cargando países...</p>
            </div>
        );
    }

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>¡Bienvenido!</h1>
            <p className={styles.subtitle}>Selecciona tu país para comenzar</p>

            <div className={styles.selectorContainer}>
                <label className={styles.label}>País</label>
                <div
                    className={styles.customSelect}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {tempSelected ? tempSelected.name : 'Selecciona un país'}
                    <ChevronDown />

                    {isOpen && (
                        <div className={styles.dropdown}>
                            {countries.map(country => (
                                <div
                                    key={country.id}
                                    className={styles.option}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTempSelected(country);
                                        setIsOpen(false);
                                    }}
                                >
                                    {country.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className={styles.button}
                    disabled={!tempSelected}
                    onClick={handleSelect}
                >
                    Continuar
                </button>

                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    color: '#C7C7CC',
                    fontSize: '11px',
                    fontFamily: 'var(--font-museo)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Versión {APP_VERSION}
                </div>
            </div>
        </main>
    );
}
