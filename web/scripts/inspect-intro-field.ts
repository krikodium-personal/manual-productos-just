import { createDirectus, rest, readField, authentication } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
    .with(authentication())
    .with(rest());

async function inspectIntro() {
    console.log("Logging in as admin...");
    await client.login({ email: 'admin@example.com', password: 'password' });

    console.log("Inspecting 'intro_questions'...");
    try {
        const field = await client.request(readField('products', 'intro_questions'));
        console.log(JSON.stringify(field, null, 2));
    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

inspectIntro();
