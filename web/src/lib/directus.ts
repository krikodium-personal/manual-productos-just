import { createDirectus, rest } from '@directus/sdk';

// Adjust URL as needed (environment variable in production)
const DIRECTUS_URL = 'http://localhost:8055';

export const directus = createDirectus(DIRECTUS_URL).with(rest());

export const getAssetUrl = (id: string) => {
    if (!id) return '';
    return `${DIRECTUS_URL}/assets/${id}`;
};
