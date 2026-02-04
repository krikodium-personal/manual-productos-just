'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { directus } from '@/lib/directus';
import { readItems } from '@directus/sdk';

interface Country {
    id: string | number;
    name: string;
    domain?: string;
    currency_symbol?: string;
}

interface CountryContextType {
    selectedCountry: Country | null;
    selectCountry: (country: Country) => void;
    isLoading: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const saved = localStorage.getItem('selected_country');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSelectedCountry(parsed);

                // If missing symbol or domain, re-fetch to update local data
                if (!parsed.currency_symbol || !parsed.domain) {
                    const fetchFullDetails = async () => {
                        try {
                            const country = await directus.request(readItems('countries', {
                                filter: { id: { _eq: parsed.id } },
                                fields: ['id', 'name', 'domain', 'currency_symbol']
                            }));
                            if (country && country.length > 0) {
                                selectCountry(country[0] as unknown as Country);
                            }
                        } catch (e) {
                            console.error("Error re-fetching country details", e);
                        }
                    };
                    fetchFullDetails();
                }
            } catch (e) {
                console.error("Error parsing saved country", e);
            }
        }
        setIsLoading(false);
    }, []);

    const selectCountry = (country: Country) => {
        setSelectedCountry(country);
        localStorage.setItem('selected_country', JSON.stringify(country));
        // Redirect to home or refresh?
        // router.push('/');
    };

    // Auto-redirect if no country selected (except on selector page)
    useEffect(() => {
        if (!isLoading && !selectedCountry && pathname !== '/select-country' && !pathname.startsWith('/api')) {
            router.replace('/select-country');
        }
    }, [selectedCountry, isLoading, pathname, router]);

    return (
        <CountryContext.Provider value={{ selectedCountry, selectCountry, isLoading }}>
            {children}
        </CountryContext.Provider>
    );
}

export function useCountry() {
    const context = useContext(CountryContext);
    if (context === undefined) {
        throw new Error('useCountry must be used within a CountryProvider');
    }
    return context;
}
