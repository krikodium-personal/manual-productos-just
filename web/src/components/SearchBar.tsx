'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchIcon, SearchClearIcon, InfoIcon } from './Icons';
import { getAssetUrl } from '@/lib/directus';
import styles from './SearchBar.module.css';

interface SearchResult {
    id: string;
    name: string;
    slug?: string;
    photo?: string;
    short_description?: string;
    type?: 'product' | 'need' | 'ingredient';
}

interface SearchBarProps {
    type: 'products' | 'needs' | 'all';
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ type, placeholder = 'Buscar...', className }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
                const data = await response.json();
                setResults(data.results || []);
                setShowDropdown(true);
                setIsLoading(false);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query, type]);

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const router = useRouter();

    const getResultUrl = (result: SearchResult) => {
        if (result.type === 'need') {
            return `/info/needs/${result.slug || result.id}`;
        }
        if (result.type === 'ingredient') {
            return `/search?q=${encodeURIComponent(result.name)}`;
        }
        return `/products/${result.slug || result.id}`;
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown && e.key === 'Enter' && query.length >= 2) {
            e.preventDefault();
            router.push(`/search?q=${encodeURIComponent(query)}`);
            return;
        }

        if (!showDropdown || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    const result = results[selectedIndex];
                    const url = getResultUrl(result);
                    // Use router push for client side nav
                    router.push(url);
                } else {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setShowDropdown(false);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const handleResultClick = (result: SearchResult) => {
        setShowDropdown(false);
        setQuery('');
        setResults([]);
    };



    const handleClearSearch = () => {
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={searchRef} className={`${styles.searchContainer} ${className || ''}`}>
            <div className={styles.searchWrapper}>
                <div className={styles.searchBar}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        className={styles.searchInput}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => query.length >= 2 && results.length > 0 && setShowDropdown(true)}
                    />
                    {query.length > 0 ? (
                        <button
                            onClick={handleClearSearch}
                            className={styles.iconButton}
                            aria-label="Clear search"
                        >
                            <SearchClearIcon />
                        </button>
                    ) : (
                        <SearchIcon className={styles.searchIcon} />
                    )}
                </div>
            </div>

            {showDropdown && (
                <div className={styles.dropdown}>
                    {isLoading ? (
                        <div className={styles.loadingState}>Buscando...</div>
                    ) : results.length > 0 ? (
                        <ul className={styles.resultsList}>
                            {results.map((result, index) => (
                                <li
                                    key={`${result.type}-${result.id}`}
                                    className={`${styles.resultItem} ${index === selectedIndex ? styles.selected : ''}`}
                                >
                                    <Link
                                        href={getResultUrl(result)}
                                        className={styles.resultLink}
                                        onClick={() => handleResultClick(result)}
                                    >
                                        {result.photo && result.type === 'product' && (
                                            <img
                                                src={getAssetUrl(result.photo, { width: 80, height: 80, fit: 'cover', quality: 80 })}
                                                alt={result.name}
                                                className={styles.resultImage}
                                            />
                                        )}
                                        <div className={styles.resultInfo}>
                                            <div className={styles.resultName}>
                                                {result.name}
                                                {result.type === 'need' && (
                                                    <span className={`${styles.typeBadge} ${styles.typeBadgeNeed}`}>Necesidad</span>
                                                )}
                                                {result.type === 'ingredient' && (
                                                    <span className={`${styles.typeBadge} ${styles.typeBadgeIngredient}`}>Ingrediente</span>
                                                )}
                                            </div>
                                            {result.short_description && (
                                                <div className={styles.resultDescription}>{result.short_description}</div>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.emptyState}>No se encontraron resultados</div>
                    )}
                </div>
            )}
        </div>
    );
}
