import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ ONLY SAFE MODEL
const model = genAI.getGenerativeModel({
    model: "gemini-1.0-pro",
});

/* ---------------- CHAT WITH CONTEXT ---------------- */

export const chatWithContext = async (question, chunks) => {
    try {
        const context = chunks
            .map(c => c.content)
            .join("\n\n")
            .slice(0, 8000);

        const prompt = `
Answer the question ONLY using the context below.
If the answer is not present, say "Not found in document".

Context:
${context}

Question:
${question}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (!text) {
            throw new Error("Empty response from Gemini");
        }

        return text;
    } catch (err) {
        console.error("GEMINI CHAT ERROR:", err);
        throw new Error("Failed to process chat request");
    }
};

/* ---------------- SUMMARY ---------------- */

export const generateSummary = async (text) => {
    try {
        const result = await model.generateContent(
            `Summarize the following text:\n${text.slice(0, 8000)}`
        );
        return result.response.text();
    } catch (err) {
        console.error("SUMMARY ERROR:", err);
        throw err;
    }
};

/* ---------------- FLASHCARDS ---------------- */

export const generateFlashcards = async (text, count = 10) => {
    try {
        const prompt = `
Create ${count} flashcards.

Format:
Q:
A:

Text:
${text.slice(0, 8000)}
`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("FLASHCARD ERROR:", err);
        throw err;
    }
};

/* ---------------- QUIZ ---------------- */

export const generateQuiz = async (text, count = 5) => {
    try {
        const prompt = `
Create ${count} MCQs from the text.

Text:
${text.slice(0, 8000)}
`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("QUIZ ERROR:", err);
        throw err;
    }
};

/* ---------------- EXPLAIN CONCEPT ---------------- */

export const explainConcept = async (concept, context) => {
    try {
        const prompt = `
Explain "${concept}" using the context:

${context.slice(0, 8000)}
`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("EXPLAIN ERROR:", err);
        throw err;
    }
};
