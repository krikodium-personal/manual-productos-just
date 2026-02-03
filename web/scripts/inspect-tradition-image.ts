import { createDirectus, rest, readField, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function inspect() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Reading field 'tradition_image' from 'products'...");
        const field = await client.request(readField('products', 'tradition_image'));

        console.log(JSON.stringify(field, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

inspect();
