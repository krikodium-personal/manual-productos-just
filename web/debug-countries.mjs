import { createDirectus, rest, readItems } from '@directus/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const directus = createDirectus(url).with(rest());

async function debug() {
    try {
        console.log("Fetching countries from:", url);
        const countries = await directus.request(readItems('countries', {
            limit: 10,
            fields: ['*']
        }));

        console.log("Countries data:");
        console.log(JSON.stringify(countries, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }
}

debug();
