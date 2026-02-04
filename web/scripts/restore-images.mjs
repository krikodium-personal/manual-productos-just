
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-4078.up.railway.app';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const UPLOADS_DIR = path.resolve(__dirname, '../../cms/uploads');

async function restoreImages() {
    console.log(`🚀 Starting Image Restoration...`);
    console.log(`TARGET: ${DIRECTUS_URL}`);
    console.log(`SOURCE: ${UPLOADS_DIR}`);

    // 1. Login
    let token;
    try {
        const authRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
        });

        if (!authRes.ok) throw new Error(`Login failed: ${authRes.statusText}`);
        const authData = await authRes.json();
        token = authData.data.access_token;
        console.log(`✅ Authentication successful.`);
    } catch (e) {
        console.error(`❌ Authentication Error:`, e.message);
        console.log(`   Verify your ADMIN_EMAIL and ADMIN_PASSWORD in the script or environment variables.`);
        return;
    }

    // 2. Read Files
    const files = fs.readdirSync(UPLOADS_DIR);
    const originalFiles = files.filter(f => !f.includes('__') && f.match(/^[0-9a-f-]{36}\./));

    console.log(`📂 Found ${originalFiles.length} original files to process.`);

    let successCount = 0;
    let errorCount = 0;


    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.avif': 'image/avif',
        '.pdf': 'application/pdf',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp'
    };

    for (const filename of originalFiles) {
        const filePath = path.join(UPLOADS_DIR, filename);
        const fileId = filename.split('.')[0];
        const ext = path.extname(filename).toLowerCase();
        const type = mimeTypes[ext] || 'application/octet-stream';

        // console.log(`Processing ${filename} (${type})...`);

        try {
            // Read file blob
            const fileBuffer = fs.readFileSync(filePath);
            const blob = new Blob([fileBuffer], { type });

            const formData = new FormData();
            formData.append('file', blob, filename);

            // PATCH the existing file record with the new content
            // We use the ID to target the specific record
            const uploadRes = await fetch(`${DIRECTUS_URL}/files/${fileId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Content-Type is auto-set by FormData
                },
                body: formData
            });

            if (uploadRes.ok) {
                process.stdout.write('.');
                successCount++;
            } else {
                // If 404, maybe the record doesn't exist? Try POST?
                // But user wants to fix BROKEN images, so 404 means sync issue.
                // If 403, permission issue.
                const err = await uploadRes.text();
                console.error(`\n❌ Failed ${filename}: ${uploadRes.status} - ${err}`);
                errorCount++;
            }

        } catch (e) {
            console.error(`\n❌ Error processing ${filename}:`, e.message);
            errorCount++;
        }
    }

    console.log(`\n\n✨ Done!`);
    console.log(`✅ Restored: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
}

restoreImages();
