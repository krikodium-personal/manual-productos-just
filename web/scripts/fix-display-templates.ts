
import { createDirectus, rest, updateCollection, updateField, authentication } from '@directus/sdk';
import 'dotenv/config';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function main() {
    try {
        await client.login({ email: 'admin@example.com', password: 'password' });

        console.log("1. Setting display_template for 'products'...");
        await client.request(updateCollection('products', {
            meta: {
                display_template: '{{name}}'
            }
        }));
        console.log("   -> Set products display_template to '{{name}}'");

        console.log("2. Updating 'related_products' field interface and display...");
        await client.request(updateField('products', 'related_products', {
            meta: {
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
                // Note: The template for M2M interface (the chips) is defined here
                interface: 'list-m2m',
                options: {
                    template: '{{related_products_id.name}}',
                    enable_create: false // Disable creating new products from here just to be safe/clean
                },
                // The display in the table view
                display: 'related-values',
                display_options: {
                    template: '{{related_products_id.name}}'
                },
                note: "Configuración actualizada via script: Muestra nombres de productos."
            }
        }));
        console.log("   -> Updated related_products field config.");

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
