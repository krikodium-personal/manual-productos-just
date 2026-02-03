const url = 'http://localhost:8055';

async function checkPublicAccess() {
    try {
        console.log('--- Testing Public Content Access ---');
        // 1. Fetch vital_just_content (Public)
        const res = await fetch(`${url}/items/vital_just_content`);
        const json = await res.json();

        if (json.errors) {
            console.error('❌ Error fetching content:', json.errors[0].message);
            return;
        }

        const data = json.data;
        console.log('✅ Content fetched successfully.');
        console.log('Hero Image ID:', data.hero_image);

        if (data.hero_image) {
            console.log('--- Testing Public Image Access ---');
            // 2. Fetch the image asset
            const imgRes = await fetch(`${url}/assets/${data.hero_image}`);
            if (imgRes.ok) {
                console.log(`✅ Image asset accessible (Status: ${imgRes.status})`);
            } else {
                console.error(`❌ Image asset access failed (Status: ${imgRes.status} ${imgRes.statusText})`);
            }
        } else {
            console.log('⚠️ No hero_image is set in the content.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkPublicAccess();
