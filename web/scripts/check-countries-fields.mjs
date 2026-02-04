import { createDirectus, rest, readItems } from '@directus/sdk';

const directus = createDirectus('https://directus-production-4078.up.railway.app').with(rest());

async function run() {
    try {
        const countries = await directus.request(readItems('countries', {
            limit: 1
        }));
        console.log('Sample country object keys:', Object.keys(countries[0] || {}));
        console.log('Sample country object:', countries[0]);
    } catch (e) {
        console.error(e);
    }
}
run();
