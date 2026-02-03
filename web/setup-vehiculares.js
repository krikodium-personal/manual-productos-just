const { createDirectus, rest, staticToken, createCollection, createField, createItem, readItems, readCollections } = require('@directus/sdk');

const url = 'http://localhost:8055';
const email = 'admin@example.com';
const password = 'password';
const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

async function setup() {
    try {
        console.log('Authenticating...');
        const authResponse = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const authData = await authResponse.json();
        const token = authData.data.access_token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const client = createDirectus(url).with(rest()).with(staticToken(token));

        // 1. Create collections if not exist
        const collections = await client.request(readCollections());
        const existing = collections.map(c => c.collection);

        if (!existing.includes('vehicular_content')) {
            console.log('Creating vehicular_content collection...');
            await client.request(createCollection({
                collection: 'vehicular_content',
                meta: {
                    display_template: '{{title}}',
                    icon: 'auto_awesome',
                    note: 'Content for the Vehiculares Aromablends landing page'
                },
                schema: {},
                fields: [
                    {
                        field: 'id',
                        type: 'integer',
                        meta: { hidden: true },
                        schema: { is_primary_key: true, has_auto_increment: true }
                    },
                    {
                        field: 'title',
                        type: 'string',
                        meta: { interface: 'input', width: 'full' }
                    },
                    {
                        field: 'description',
                        type: 'text',
                        meta: { interface: 'textarea', width: 'full' }
                    },
                    {
                        field: 'advantages_subtitle',
                        type: 'string',
                        meta: { interface: 'input', width: 'full' }
                    }
                ]
            }));
        }

        if (!existing.includes('vehicular_advantages')) {
            console.log('Creating vehicular_advantages collection...');
            await client.request(createCollection({
                collection: 'vehicular_advantages',
                meta: {
                    display_template: '{{text}}',
                    icon: 'list',
                    note: 'Advantages list for Vehiculares'
                },
                schema: {},
                fields: [
                    {
                        field: 'id',
                        type: 'integer',
                        meta: { hidden: true },
                        schema: { is_primary_key: true, has_auto_increment: true }
                    },
                    {
                        field: 'text',
                        type: 'text',
                        meta: { interface: 'textarea', width: 'full' }
                    },
                    {
                        field: 'vehicular_content_id',
                        type: 'integer',
                        meta: { interface: 'select-dropdown-m2o', width: 'full' }
                    }
                ]
            }));
        }

        // 2. Grant permissions
        for (const col of ['vehicular_content', 'vehicular_advantages']) {
            const check = await fetch(`${url}/permissions?filter[policy][_eq]=${publicPolicyId}&filter[collection][_eq]=${col}&filter[action][_eq]=read`, { headers });
            const checkData = await check.json();
            if (checkData.data && checkData.data.length === 0) {
                console.log(`Granting PUBLIC READ to ${col}...`);
                await fetch(`${url}/permissions`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ policy: publicPolicyId, collection: col, action: 'read', fields: ['*'] })
                });
            }
        }

        // 3. Populate data
        console.log('Checking for existing data...');
        const existingContent = await client.request(readItems('vehicular_content'));
        if (existingContent.length === 0) {
            console.log('Populating data...');
            const vehicular = await client.request(createItem('vehicular_content', {
                title: 'Vehiculares Aromablends',
                description: 'La línea de vehiculares Aromablends fue especialmente diseñada para que puedas crear tus propias sinergias de aromaterapia de manera fácil y divertida. Simplemente mezcla unas gotitas de uno o varios de tus aceites esenciales favoritos dentro del Vehicular Aromablends que más te guste y se adapte a tu momento, y disfruta del poder de la naturaleza todos los días. Es tan fácil preparar una mezcla con los Vehiculares Aromablends que querrás crear una nueva combinación todos los días.',
                advantages_subtitle: 'Ventajas de los vehiculares aromablends'
            }));

            const advantages = [
                'Ideal para combinar uno o varios de estos aceites esenciales de acuerdo al efecto que quieras lograr. Sugerimos no mezclar más de 3 aceites esenciales para preservar la pureza de los aromas.',
                'No posee aroma ni fragancia para no interferir con los aromas naturales de los aceites esenciales.',
                'Reduce la evaporación de los aceites esenciales para promover su mejor absorción.',
                'Es soluble con los aceites esenciales permitiendo emulsionarlos con total eficacia.',
                'Ideal para toda la familia.'
            ];

            for (const text of advantages) {
                await client.request(createItem('vehicular_advantages', {
                    text,
                    vehicular_content_id: vehicular.id
                }));
            }
        }

        // 4. Create missing products for category 7 if they don't exist
        console.log('Checking for Aromablends products...');
        const productList = [
            { code: '1026', name: 'Crema Vehicular Aromablends 60g' },
            { code: '1025', name: 'Bruma Vehicular Aromablends 200ml' },
            { code: '1024', name: 'Aceite Vehicular Aromablends 120ml' }
        ];

        for (const p of productList) {
            const found = await client.request(readItems('products', { filter: { product_code: { _eq: p.code } } }));
            if (found.length === 0) {
                console.log(`Creating product placeholder: ${p.name} (${p.code})`);
                await client.request(createItem('products', {
                    name: p.name,
                    product_code: p.code,
                    category: 7,
                    slug: p.name.toLowerCase().replace(/ /g, '-')
                }));
            }
        }

        console.log('Done!');
    } catch (e) {
        console.error('Setup failed:', e);
    }
}

setup();
