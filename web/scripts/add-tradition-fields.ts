import { createDirectus, rest, createField, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function addFields() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log('Adding Tradition Herbal fields...');

        // 1. Divider/Header
        try {
            await client.request(createField('products', {
                field: 'tradition_divider',
                type: 'alias',
                meta: {
                    interface: 'presentation-divider',
                    special: ['alias', 'no-data'],
                    options: {
                        title: 'Tradición Herbal',
                        icon: 'local_florist',
                        marginTop: true
                    }
                },
                schema: undefined
            }));
            console.log('Divider added.');
        } catch (e: any) {
            console.log('Divider might already exist or error:', e.message);
        }

        // 2. Tradition Image
        try {
            await client.request(createField('products', {
                field: 'tradition_image',
                type: 'uuid',
                meta: {
                    interface: 'image',
                    note: 'Imagen principal de la sección Tradición Herbal',
                    options: {
                        crop: false
                    }
                },
                schema: {
                    is_nullable: true,
                    foreign_key_table: 'directus_files',
                    foreign_key_column: 'id'
                } as any
            }));
            console.log('tradition_image added.');
        } catch (e: any) {
            console.log('tradition_image error:', e.message);
        }

        // 3. Tradition Title
        try {
            await client.request(createField('products', {
                field: 'tradition_title',
                type: 'string',
                meta: {
                    interface: 'input',
                    options: {
                        placeholder: 'Ej: INFORMACIÓN'
                    },
                    width: 'half'
                }
            }));
            console.log('tradition_title added.');
        } catch (e: any) {
            console.log('tradition_title error:', e.message);
        }

        // 4. Tradition Text (Rich Text)
        try {
            await client.request(createField('products', {
                field: 'tradition_text',
                type: 'text',
                meta: {
                    interface: 'input-rich-text-html', // or wysiwyg
                    options: {
                        toolbar: ['bold', 'italic', 'underline', 'link']
                    }
                }
            }));
            console.log('tradition_text added.');
        } catch (e: any) {
            console.log('tradition_text error:', e.message);
        }

        // 5. Extraction Method
        try {
            await client.request(createField('products', {
                field: 'tradition_extraction',
                type: 'text',
                meta: {
                    interface: 'textarea', // or input for shorter text
                    note: 'Método de extracción del aceite'
                }
            }));
            console.log('tradition_extraction added.');
        } catch (e: any) {
            console.log('tradition_extraction error:', e.message);
        }

    } catch (error) {
        console.error('Main error:', error);
    }
}

addFields();
