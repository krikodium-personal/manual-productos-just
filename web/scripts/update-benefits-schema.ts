import { createDirectus, rest, authentication, readField, updateField } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication());

async function run() {
    try {
        // 1. Authenticate (try object syntax first)
        try {
            await client.login('admin@example.com', 'password');
        } catch (e) {
            // @ts-ignore
            await client.login({ email: 'admin@example.com', password: 'password' });
        }
        console.log("Logged in.");

        // 2. Fetch current field config
        const field = await client.request(readField('products', 'benefits'));
        console.log("Current Field Config Found.");

        // 3. Prepare Update
        let currentFields = field.meta?.options?.fields || [];

        // Check if description already exists
        const hasDesc = currentFields.find((f: any) => f.field === 'description');

        if (hasDesc) {
            console.log("Field 'description' already exists in schema.");
            return;
        }

        // Add new description field definition
        const newField = {
            field: 'description',
            name: 'Description',
            type: 'text',
            meta: {
                interface: 'input-multiline',
                width: 'full',
                options: {
                    placeholder: 'Enter detailed benefit description...'
                }
            }
        };

        const newFields = [...currentFields, newField];

        // 4. Update the field
        await client.request(updateField('products', 'benefits', {
            meta: {
                ...field.meta,
                options: {
                    ...field.meta?.options,
                    fields: newFields,
                    addLabel: 'Add Benefit'
                }
            }
        }));

        console.log("Successfully added 'description' field to benefits schema.");

    } catch (e) {
        console.error("Error updating schema:", e);
    }
}

run();
