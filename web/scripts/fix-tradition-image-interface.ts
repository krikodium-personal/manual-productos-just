import { createDirectus, rest, updateField, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function fix() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log('Updating Tradition Image interface from text input to File Image...');

        await client.request(updateField('products', 'tradition_image', {
            meta: {
                interface: 'file-image',
                special: ['file'],
                note: 'Imagen principal de la sección Tradición Herbal',
                options: {
                    folder: null
                }
            }
        }));

        console.log('Success: Updated tradition_image interface to file-image.');

    } catch (e: any) {
        console.error('Error:', e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

fix();
