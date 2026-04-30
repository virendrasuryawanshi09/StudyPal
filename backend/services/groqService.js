import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.warn("GROQ_API_KEY is missing or invalid in .env. Groq fallback will fail if invoked.");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "placeholder_key",
});

// Using llama-3.3-70b-versatile as it is extremely fast and capable for parsing text
const MODEL = "llama-3.3-70b-versatile";

/* ---------------- HELPER ---------------- */

async function callGroq(systemPrompt, userPrompt, jsonFormat = false) {
    try {
        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: jsonFormat ? { type: "json_object" } : undefined,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("GROQ API ERROR:", error.message);
        throw new Error("Groq Fallback failed: " + error.message);
    }
}

/* ---------------- CHAT WITH CONTEXT ---------------- */

export const chatWithContext = async (question, chunks) => {
    try {
        const context = chunks
            .map(c => c.content)
            .join("\n\n")
            .slice(0, 8000);

        const system = `You are a helpful study assistant. Answer the user's question ONLY using the context below. If the answer is not present, say "Not found in document".\n\nContext:\n${context}`;

        return await callGroq(system, question);
    } catch (err) {
        console.error("GROQ CHAT ERROR:", err);
        throw err;
    }
};

/* ---------------- SUMMARY ---------------- */

export const generateSummary = async (text) => {
    try {
        const system = "You are a helpful study assistant. Summarize the user's text clearly and concisely.";
        return await callGroq(system, `Summarize the following text:\n\n${text.slice(0, 8000)}`);
    } catch (err) {
        console.error("GROQ SUMMARY ERROR:", err);
        throw err;
    }
};

/* ---------------- FLASHCARDS ---------------- */

export const generateFlashcards = async (text, count = 10) => {
    try {
        const system = `Create ${count} flashcards from the text below.
Return ONLY a valid JSON array of objects.
Each object must have the exact following structure:
{
  "question": "The question text",
  "answer": "The answer text"
}`;
        const resString = await callGroq(system, `Text:\n${text.slice(0, 8000)}`, true);
        try {
            const parsed = JSON.parse(resString);
            return parsed.flashcards || parsed.cards || parsed;
        } catch (e) {
            throw new Error("Failed to parse flashcards JSON");
        }
    } catch (err) {
        console.error("GROQ FLASHCARD ERROR:", err);
        throw err;
    }
};

/* ---------------- QUIZ ---------------- */

export const generateQuiz = async (text, count = 5) => {
    try {
        const system = `Create ${count} multiple choice questions (MCQs) from the text.
Return ONLY valid JSON.
The absolute root of the JSON must be an object with a "questions" array.
Each object in the array must have the exact following structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact string of the correct option",
  "explanation": "A short explanation of why it is correct",
  "difficulty": "medium"
}`;

        const resString = await callGroq(system, `Text:\n${text.slice(0, 8000)}`, true);

        try {
            const parsed = JSON.parse(resString);
            if (parsed.questions && Array.isArray(parsed.questions)) {
                return parsed.questions;
            }
            return parsed; // Fallback if they didn't wrap it
        } catch (parseError) {
            console.error("GROQ JSON PARSE ERROR. Raw string:", resString);
            throw new Error("Failed to parse quiz JSON from AI fallback response");
        }
    } catch (err) {
        console.error("GROQ QUIZ GENERATION ERROR:", err);
        throw err;
    }
};

/* ---------------- EXPLAIN CONCEPT ---------------- */

export const explainConcept = async (concept, context) => {
    try {
        const system = `You are a helpful study assistant. Explain the concept using the context below in simple terms.\n\n${context.slice(0, 8000)}`;
        return await callGroq(system, `Explain the concept "${concept}"`);
    } catch (err) {
        console.error("GROQ EXPLAIN ERROR:", err);
        throw err;
    }
};
