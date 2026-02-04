import { createDirectus, rest } from '@directus/sdk';

// Adjust URL as needed (environment variable in production)
// Adjust URL as needed (environment variable in production)
// Server-side: Use env var directly
// Client-side: Use proxy to avoid CORS
const DIRECTUS_URL = typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055')
    : `${window.location.origin}/api/directus`;

export const directus = createDirectus(DIRECTUS_URL).with(rest());

export interface ThumbnailOptions {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'cover' | 'contain' | 'inside' | 'outside';
    format?: 'jpg' | 'png' | 'webp' | 'avif';
}

export const getAssetUrl = (id: string, options?: ThumbnailOptions) => {
    if (!id) return '';

    let url = '';

    // Server-side: Use absolute URL
    if (typeof window === 'undefined') {
        const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
        url = `${baseUrl}/assets/${id}`;
    } else {
        // Client-side: Use proxy to avoid CORS/Hotlinking issues
        url = `${window.location.origin}/api/assets/${id}`;
    }

    if (options) {
        const params = new URLSearchParams();
        if (options.width) params.set('width', options.width.toString());
        if (options.height) params.set('height', options.height.toString());
        if (options.quality) params.set('quality', options.quality.toString());
        if (options.fit) params.set('fit', options.fit);
        if (options.format) params.set('format', options.format);

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    return url;
};
