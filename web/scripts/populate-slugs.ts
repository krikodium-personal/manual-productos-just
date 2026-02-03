import { createDirectus, rest, readItems, updateItem, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
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

async function populateSlugs() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        const products = await client.request(readItems('products', {
            fields: ['id', 'name']
        }));

        for (const product of products) {
            const slug = slugify(product.name);
            console.log(`Updating Product ${product.id}: ${product.name} -> ${slug}`);
            await client.request(updateItem('products', product.id, {
                slug: slug
            }));
        }

        console.log("All slugs updated.");

    } catch (error) {
        console.error('Error:', error);
    }
}

populateSlugs();
