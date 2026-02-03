import { createDirectus, rest, readFiles, authentication } from '@directus/sdk';
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });
        const files = await client.request(readFiles({ limit: 5 }));
        console.log("Files:", files.map(f => ({ id: f.id, filename: f.filename_download })));
    } catch (error) {
        console.error(error);
    }
}
main();
