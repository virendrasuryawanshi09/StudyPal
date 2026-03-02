import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const key = process.env.GEMINI_API_KEY;

const sampleText = "Photosynthesis is the process by which green plants convert sunlight, water and carbon dioxide into glucose and oxygen. Chlorophyll in leaves absorbs sunlight. The process has two stages: light-dependent reactions and the Calvin cycle.";

const prompt = `
Create 3 flashcards from the text below.

Format strictly as:
Q: [Question]
A: [Answer]

Text:
${sampleText}
`;

console.log("Testing flashcard generation with gemini-2.5-flash...");
try {
    const res = await fetch(`${GEMINI_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
    });
    const data = await res.json();
    if (data.error) {
        console.error("GEMINI ERROR:", JSON.stringify(data.error, null, 2));
    } else {
        const text = data.candidates[0].content.parts[0].text;
        console.log("SUCCESS! Raw response:\n", text);

        // Test the parsing logic
        const blocks = text.split("\n\n");
        const cards = [];
        for (let block of blocks) {
            const questionMatch = block.match(/Q:\s*(.*)/);
            const answerMatch = block.match(/A:\s*(.*)/);
            if (questionMatch && answerMatch) {
                cards.push({ question: questionMatch[1].trim(), answer: answerMatch[1].trim() });
            }
        }
        console.log(`\nParsed ${cards.length} cards:`, JSON.stringify(cards, null, 2));
    }
} catch (err) {
    console.error("FETCH ERROR:", err.message, err.stack);
}
