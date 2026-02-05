'use client';

import { useEffect, useState, useMemo } from 'react';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import styles from './ingredients.module.css';
import { ChevronRight, SearchIcon, ArrowBack, CloseIcon } from '@/components/Icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Helper to group by first letter
const groupBy = (array: any[], key: string) => {
    return array.reduce((result, currentValue) => {
        const name = currentValue[key];
        let groupKey = '#';
        if (name) {
            // Normalize accents: Á -> A, etc.
            groupKey = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").charAt(0).toUpperCase();
        }
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(currentValue);
        return result;
    }, {});
};

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch all ingredients, sorted by name
                // Assuming field is 'name' or 'nombre'. Checking previous artifacts, it seems 'name' is standard.
                // If fails, we will debug. 'limit: -1' to get all.
                const result = await directus.request(readItems('ingredients', {
                    limit: -1,
                    sort: ['name'],
                    fields: ['id', 'name', 'slug'] // minimal fields including slug
                }));
                // Map result to ensure we have displayable names
                // If valid result is array
                if (Array.isArray(result)) {
                    setIngredients(result);
                }
            } catch (error) {
                console.error('Error fetching ingredients:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filter and Group Logic
    const groupedIngredients = useMemo(() => {
        // Helper
        const normalize = (text: string) =>
            text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

        // 1. Filter
        const filtered = ingredients.filter(item =>
            item.name && normalize(item.name).includes(normalize(searchQuery))
        );

        // 2. Group
        const groups = groupBy(filtered, 'name');

        // 3. Sort keys (A, B, C...)
        const sortedKeys = Object.keys(groups).sort();

        return sortedKeys.map(key => ({
            letter: key,
            items: groups[key]
        }));
    }, [ingredients, searchQuery]);


    if (loading) {
        return (
            <main className={styles.main}>
                {/* Header Mock for loading */}
                <div className={styles.headerContainer}>
                    <div className={styles.topBar}>
                        <div className={styles.backButton} onClick={() => router.back()}>
                            <ArrowBack />
                        </div>
                        <h1 className={styles.headerTitle}>Índice de Ingredientes Naturales</h1>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', width: '100%', marginTop: '132px' }}>
                    <p style={{ color: '#908F9A' }}>Cargando...</p>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            {/* Fixed Header Section */}
            <div className={styles.headerContainer}>
                <div className={styles.topBar}>
                    <div className={styles.backButton} onClick={() => router.back()}>
                        <ArrowBack />
                    </div>
                    <h1 className={styles.headerTitle}>Índice de Ingredientes Naturales</h1>
                </div>

                <div className={styles.searchContainer}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Buscar ingredientes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className={styles.searchIcon} onClick={() => setSearchQuery('')}>
                            {searchQuery.length > 0 ? <CloseIcon /> : <SearchIcon />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable List Content */}
            <div className={styles.listContainer}>
                {groupedIngredients.map((group) => (
                    <div key={group.letter} className={styles.groupContainer}>
                        <div className={styles.groupHeader}>
                            <span className={styles.groupTitle}>{group.letter}</span>
                        </div>

                        <div className={styles.itemsList}>
                            {group.items.map((item: any) => (
                                <Link
                                    href={`/info/ingredients/${item.slug || item.id}`}
                                    key={item.id}
                                    className={styles.itemLink}
                                >
                                    <div className={styles.itemContent}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <ChevronRight className={styles.chevronIcon} />
                                    </div>
                                    <div className={styles.divider}></div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
                {groupedIngredients.length === 0 && !loading && (
                    <p style={{ textAlign: 'center', color: '#908F9A', width: '100%', marginTop: '20px' }}>
                        No se encontraron ingredientes.
                    </p>
                )}
            </div>
        </main>
    );
}
