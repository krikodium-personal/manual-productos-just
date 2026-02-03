import { createDirectus, rest, readItems, uploadFiles, updateItem, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

const SVG_CONTENT = `<svg width="82" height="82" viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_7326_7448)">
<circle cx="41" cy="41" r="41" fill="#16BE7D"/>
<path d="M38.8335 58.1161C40.0711 57.4016 40.8335 56.0811 40.8335 54.652L40.8335 46.1991C40.8335 44.7701 40.0712 43.4497 38.8336 42.7351L31.5127 38.5079C30.275 37.7933 28.75 37.7933 27.5123 38.508L20.1921 42.7351C18.9547 43.4497 18.1924 44.7701 18.1924 46.199L18.1924 54.6521C18.1924 56.0811 18.9547 57.4016 20.1923 58.1161L27.5124 62.3428C28.7501 63.0573 30.2749 63.0574 31.5125 62.3428L38.8335 58.1161Z" fill="white"/>
<path d="M43.8566 42.7343C42.6189 43.4488 41.8564 44.7693 41.8564 46.1985L41.8564 54.6521C41.8564 56.0811 42.6188 57.4016 43.8563 58.1161L51.1765 62.3428C52.4141 63.0573 53.939 63.0574 55.1766 62.3428L62.4975 58.1161C63.7352 57.4016 64.4976 56.0811 64.4976 54.652L64.4976 46.1985C64.4976 44.7694 63.735 43.4488 62.4973 42.7343L55.1764 38.5083C53.9388 37.7939 52.4143 37.794 51.1768 38.5084L43.8566 42.7343Z" fill="white"/>
<path d="M32.0244 22.1894C30.7868 22.9039 30.0244 24.2244 30.0244 25.6535L30.0244 34.1063C30.0244 35.5353 30.7868 36.8558 32.0243 37.5704L39.3453 41.7973C40.583 42.5119 42.1079 42.5119 43.3455 41.7972L50.6657 37.5704C51.9032 36.8558 52.6655 35.5354 52.6655 34.1064L52.6655 25.6534C52.6655 24.2244 51.9032 22.9039 50.6656 22.1894L43.3455 17.9627C42.1078 17.2481 40.583 17.2481 39.3454 17.9627L32.0244 22.1894Z" fill="white"/>
<path d="M12 70.5L70.5 12" stroke="white" stroke-width="2"/>
</g>
<defs>
<clipPath id="clip0_7326_7448">
<rect width="82" height="82" fill="white"/>
</clipPath>
</defs>
</svg>`;

async function updateIcon() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        // 1. Find the Attribute
        const attributes = await client.request(readItems('attributes', {
            filter: {
                name: { _contains: 'FTALATOS' } // Fuzzy search
            }
        }));

        if (attributes.length === 0) {
            console.error('Attribute not found.');
            return;
        }
        const attribute = attributes[0];
        console.log(`Found attribute: ${attribute.name} (ID: ${attribute.id})`);

        // 2. Upload new SVG
        const formData = new FormData();
        const blob = new Blob([SVG_CONTENT], { type: 'image/svg+xml' });
        formData.append('file', blob, 'sin-ftalatos.svg');
        formData.append('title', 'Sin Ftalatos Icon');

        console.log('Uploading new SVG...');
        const fileResult = await client.request(uploadFiles(formData));
        const newFileId = fileResult.id;
        console.log(`Uploaded new file: ${newFileId}`);

        // 3. Update Attribute
        console.log('Updating attribute icon...');
        await client.request(updateItem('attributes', attribute.id, {
            icon: newFileId
        }));

        console.log('Success: Icon updated.');

    } catch (e: any) {
        console.error('Error:', e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

updateIcon();
