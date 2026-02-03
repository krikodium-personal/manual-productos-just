import { createDirectus, rest, readItems, updateItem, authentication } from '@directus/sdk';
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(authentication())
    .with(rest());

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Separate accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
}

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Logged in as admin');

        const items = await client.request(readItems('needs', {
            fields: ['id', 'name']
        }));

        console.log(`Found ${items.length} items to update.`);

        for (const item of items) {
            const slug = slugify(item.name);
            console.log(`Updating Need ${item.id}: ${item.name} -> ${slug}`);
            await client.request(updateItem('needs', item.id, {
                slug: slug
            }));
        }

        console.log("All slugs updated in 'needs' collection.");

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
