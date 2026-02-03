import { createDirectus, rest } from '@directus/sdk';

// Adjust URL as needed (environment variable in production)
// Adjust URL as needed (environment variable in production)
// Server-side: Use env var directly
// Client-side: Use proxy to avoid CORS
const DIRECTUS_URL = typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055')
    : `${window.location.origin}/api/directus`;

export const directus = createDirectus(DIRECTUS_URL).with(rest());

export const getAssetUrl = (id: string) => {
    if (!id) return '';

    // Server-side: Use absolute URL
    if (typeof window === 'undefined') {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
        return `${baseUrl}/assets/${id}`;
    }

    // Client-side: Use proxy to avoid CORS/Hotlinking issues
    return `${window.location.origin}/api/assets/${id}`;
};
