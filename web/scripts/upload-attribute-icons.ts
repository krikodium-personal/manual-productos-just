import { createDirectus, rest, authentication, updateItem, uploadFiles } from '@directus/sdk';
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { FormData } from 'formdata-node';
import { fileFromPath } from 'fetch-blob/from-path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(authentication())
    .with(rest());

async function uploadAndApply(filePath: string, attributeId: number) {
    const form = new FormData();
    const stats = fs.statSync(filePath);
    const blob = await fileFromPath(filePath, 'image/svg+xml');
    form.append('file', blob, path.basename(filePath));

    console.log(`Uploading ${filePath}...`);
    const fileResult: any = await client.request(uploadFiles(form as any));
    const fileId = fileResult.id;
    console.log(`Uploaded file ID: ${fileId}`);

    console.log(`Updating attribute ${attributeId}...`);
    await client.request(updateItem('attributes', attributeId, {
        icon: fileId
    }));
    console.log(`Attribute ${attributeId} updated successfully.`);
}

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        console.log('Logged in as admin');

        await uploadAndApply(path.resolve(process.cwd(), 'scripts/icon-attr-7.svg'), 7);
        await uploadAndApply(path.resolve(process.cwd(), 'scripts/icon-attr-8.svg'), 8);

    } catch (error: any) {
        console.error('Error:', error);
        if (error?.errors) {
            console.error('Details:', JSON.stringify(error.errors, null, 2));
        }
    }
}

main();
