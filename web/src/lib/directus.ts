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
    // Assets are usually loaded via <img> tags, so we can use the absolute URL if CORS allows simple GETs (usually yes for images)
    // OR we can proxy them too. Let's use the absolute URL for images which is standard and usually CDN friendly.
    // If images fail, we can switch to /api/assets
    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    return `${baseUrl}/assets/${id}`;
};
