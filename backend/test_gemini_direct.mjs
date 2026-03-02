import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const key = process.env.GEMINI_API_KEY;

console.log("API KEY exists:", !!key);
console.log("API KEY length:", key?.length);

async function test(label, body) {
    console.log(`\n========== TEST: ${label} ==========`);
    try {
        const res = await fetch(`${GEMINI_URL}?key=${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.error) {
            console.error("API ERROR:", JSON.stringify(data.error, null, 2));
        } else if (data.candidates) {
            const text = data.candidates[0].content.parts[0].text;
            console.log("SUCCESS. Response snippet:", text.slice(0, 200));
        } else {
            console.log("UNEXPECTED RESPONSE:", JSON.stringify(data, null, 2).slice(0, 500));
        }
    } catch (err) {
        console.error("FETCH ERROR:", err.message);
    }
}

// Test 1: Plain text
await test("Plain text prompt", {
    contents: [{ role: "user", parts: [{ text: "Say hello in one sentence." }] }]
});

// Test 2: JSON quiz prompt
await test("JSON quiz prompt", {
    contents: [{ role: "user", parts: [{ text: `Create 2 multiple choice questions from this text: "Photosynthesis is the process by which plants make food from sunlight." Return ONLY a valid JSON array. Each object must have: question, options (array of 4), correctAnswer, explanation, difficulty.` }] }]
});

console.log("\nDone.");
