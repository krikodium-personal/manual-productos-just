import { createDirectus, rest, createField, authentication } from '@directus/sdk';
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

        console.log("Adding 'domain' field to 'countries'...");

        await client.request(createField('countries', {
            field: 'domain',
            type: 'string',
            meta: {
                interface: 'input',
                display: 'raw',
                readonly: false,
                hidden: false,
                width: 'full',
                translations: [
                    { language: 'es-ES', translation: 'Dominio' },
                    { language: 'es-419', translation: 'Dominio' },
                    { language: 'en-US', translation: 'Domain' }
                ],
                note: 'Dominio asociado al país (ej: .com.mx, .cl, etc. o la URL base).'
            }
        }));

        console.log("Field 'domain' created successfully!");

    } catch (error: any) {
        console.error("Error creating field:", error.message);
        if (error.errors) {
            console.error("Details:", JSON.stringify(error.errors, null, 2));
        }
    }
}
main();
