import { createDirectus, rest, readItems, uploadFiles, updateItem, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

const UPDATES = [
    {
        nameFilter: 'COLORANTES',
        title: 'Sin Colorantes Icon',
        filename: 'sin-colorantes.svg',
        svg: `<svg width="82" height="82" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_7326_7456)">
<circle cx="41" cy="41" r="41" fill="#16BE7D"/>
<path d="M47.0799 31.7565C46.5199 31.5218 46.0398 31.3656 45.4798 31.209V29.5664L45.4803 20.0234H35.72V31.2091C35.16 31.3658 34.6798 31.5219 34.1199 31.7567C27.6401 34.2601 23 40.5178 23 47.7136C23 57.1785 30.9203 64.9226 40.6001 64.9226C50.28 64.9226 58.2003 57.1784 58.2003 47.7136C58.2003 40.5174 53.5601 34.2596 47.0799 31.7567L47.0799 31.7565Z" fill="white"/>
<path d="M34.5997 18.4585H46.6793C46.8395 18.4585 46.9993 18.4585 47.0791 18.3804C48.1192 18.1457 48.9192 17.2853 48.9192 16.1902C48.9192 14.9385 47.8791 14 46.6793 14H34.6794C33.3992 14 32.4395 15.017 32.4395 16.1902C32.4395 17.2853 33.2395 18.1457 34.2796 18.3804C34.2796 18.4585 34.4398 18.4585 34.5995 18.4585H34.5997Z" fill="white"/>
<path d="M12 70.5L70.5 12" stroke="white" stroke-width="2"/>
</g>
<defs>
<clipPath id="clip0_7326_7456">
<rect width="82" height="82" fill="white"/>
</clipPath>
</defs>
</svg>`
    },
    {
        nameFilter: 'PARABENOS',
        title: 'Sin Parabenos Icon',
        filename: 'sin-parabenos.svg',
        svg: `<svg width="82" height="82" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_7326_7464)">
<circle cx="41" cy="41" r="41" fill="#16BE7D"/>
<path d="M48.9848 43.1797C48.2702 41.9421 46.9497 41.1797 45.5207 41.1797L37.0678 41.1797C35.6388 41.1797 34.3183 41.942 33.6038 43.1795L29.3766 50.5005C28.6619 51.7382 28.6619 53.2632 29.3767 54.5009L33.6038 61.8211C34.3183 63.0585 35.6387 63.8208 37.0677 63.8208L45.5208 63.8208C46.9498 63.8208 48.2702 63.0585 48.9848 61.8209L53.2114 54.5007C53.926 53.2631 53.926 51.7383 53.2115 50.5006L48.9848 43.1797Z" fill="white"/>
<path d="M33.6029 38.1566C34.3174 39.3943 35.638 40.1567 37.0671 40.1567L45.5208 40.1567C46.9498 40.1567 48.2702 39.3944 48.9848 38.1568L53.2114 30.8367C53.926 29.5991 53.926 28.0742 53.2115 26.8366L48.9848 19.5156C48.2702 18.278 46.9497 17.5156 45.5207 17.5156L37.0672 17.5156C35.638 17.5156 34.3174 18.2781 33.6029 19.5159L29.3769 26.8368C28.6626 28.0743 28.6626 29.5989 29.377 30.8364L33.6029 38.1566Z" fill="white"/>
<path d="M13.0575 49.9888C13.7721 51.2264 15.0926 51.9888 16.5217 51.9888L24.9745 51.9888C26.4035 51.9888 27.724 51.2264 28.4385 49.9888L32.6655 42.6679C33.3801 41.4302 33.3801 39.9053 32.6654 38.6676L28.4385 31.3475C27.724 30.11 26.4035 29.3477 24.9745 29.3477L16.5216 29.3477C15.0925 29.3477 13.7721 30.11 13.0575 31.3476L8.8309 38.6677C8.11631 39.9054 8.11628 41.4302 8.83083 42.6678L13.0575 49.9888Z" fill="white"/>
<path d="M54.2499 49.9888C54.9645 51.2264 56.285 51.9888 57.714 51.9888L66.1668 51.9888C67.5959 51.9888 68.9164 51.2264 69.6309 49.9888L73.8578 42.6679C74.5725 41.4302 74.5724 39.9053 73.8578 38.6676L69.6309 31.3475C68.9164 30.11 67.5959 29.3477 66.1669 29.3477L57.7139 29.3477C56.2849 29.3477 54.9644 30.11 54.2499 31.3476L50.0233 38.6677C49.3087 39.9054 49.3087 41.4302 50.0232 42.6678L54.2499 49.9888Z" fill="white"/>
<path d="M12 70.5L70.5 12" stroke="white" stroke-width="2"/>
</g>
<defs>
<clipPath id="clip0_7326_7464">
<rect width="82" height="82" fill="white"/>
</clipPath>
</defs>
</svg>`
    },
    {
        nameFilter: 'FRAGANCIA',
        title: 'Sin Fragancia Agregada Icon',
        filename: 'sin-fragancia.svg',
        svg: `<svg width="82" height="82" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_7326_7473)">
<circle cx="41" cy="41" r="41" fill="#16BE7D"/>
<path d="M12 70.5L70.5 12" stroke="white" stroke-width="2"/>
<path d="M48.0656 30.8523C45.5056 29.7945 42.7614 29.2541 39.9914 29.2623C28.2817 29.2623 18.75 38.7857 18.75 50.4954C18.75 56.9051 21.5987 62.909 26.5675 66.9585C26.594 66.9851 26.63 67 26.6675 67H53.2927C53.3345 67 53.3749 66.9853 53.407 66.9585C58.3758 62.909 61.2245 56.9051 61.2245 50.4954C61.2245 41.8664 56.057 34.1565 48.0656 30.8523Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M44.7081 18.5133V15C44.7081 14.4477 44.2604 14 43.7081 14H37.1288C36.5765 14 36.1287 14.4477 36.1287 15V20.1136C36.1287 20.6659 36.5765 21.1136 37.1287 21.1136H43.7081C44.2604 21.1136 44.7081 20.6659 44.7081 20.1136V18.5133ZM39.3088 17.5527C39.3088 18.1572 39.8056 18.6541 40.4184 18.6541C41.023 18.6541 41.5198 18.1572 41.5198 17.5527C41.5088 17.2669 41.3875 16.9964 41.1813 16.7981C40.9752 16.5998 40.7003 16.4891 40.4143 16.4891C40.1283 16.4891 39.8534 16.5998 39.6473 16.7981C39.4411 16.9964 39.3198 17.2669 39.3088 17.5527Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M47.855 29.1712C45.47 28.3266 42.9608 27.9042 40.4184 27.9042C37.8761 27.9042 35.3669 28.3266 32.9736 29.1712C32.8652 29.2114 32.75 29.1312 32.75 29.0156V23.4717C32.75 22.9194 33.1977 22.4717 33.75 22.4717H47.0786C47.6309 22.4717 48.0786 22.9194 48.0786 23.4717V29.0156C48.0786 29.1312 47.9634 29.2114 47.855 29.1712Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_7326_7473">
<rect width="82" height="82" fill="white"/>
</clipPath>
</defs>
</svg>`
    }
];

async function updateBatch() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        for (const update of UPDATES) {
            console.log(`Processing: ${update.nameFilter}...`);

            // 1. Find
            const attributes = await client.request(readItems('attributes', {
                filter: {
                    name: { _contains: update.nameFilter }
                }
            }));

            if (attributes.length === 0) {
                console.warn(`! Attribute containing "${update.nameFilter}" not found.`);
                continue;
            }
            const attribute = attributes[0];
            console.log(`  > Found: ${attribute.name} (ID: ${attribute.id})`);

            // 2. Upload
            const formData = new FormData();
            const blob = new Blob([update.svg], { type: 'image/svg+xml' });
            formData.append('file', blob, update.filename);
            formData.append('title', update.title);

            const fileResult = await client.request(uploadFiles(formData));
            console.log(`  > Uploaded SVG: ${fileResult.id}`);

            // 3. Update
            await client.request(updateItem('attributes', attribute.id, {
                icon: fileResult.id
            }));
            console.log(`  > Linked new icon to attribute.`);
        }

    } catch (e: any) {
        console.error('Error:', e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

updateBatch();
