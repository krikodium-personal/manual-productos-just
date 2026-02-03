
import { createDirectus, rest, updateField, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("Updating field 'related_products' in 'products'...");

        await client.request(updateField('products', 'related_products', {
            meta: {
                // Change the Label
                translations: [
                    {
                        language: "es-ES",
                        translation: "Combinaciones sugeridas"
                    },
                    {
                        language: "en-US",
                        translation: "Suggested Combinations"
                    }
                ],
                // Display Configuration
                display: 'related-values',
                display_options: {
                    template: '{{related_products_id.name}}'
                },
                // Interface Configuration (Optional, usually list-m2m is fine, but maybe add columns?)
                interface: 'list-m2m',
                options: {
                    include_date: false,
                    template: '{{related_products_id.name}}'
                }
            }
        }));

        console.log("Field updated successfully.");

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
