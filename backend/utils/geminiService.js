import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

const GEMINI_URL ="https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";



/* ---------------- HELPER ---------------- */

async function callGemini(prompt) {
  const res = await fetch(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await res.json();

  if (!data.candidates || !data.candidates.length) {
    console.error("GEMINI RAW RESPONSE:", data);
    throw new Error("No response from Gemini");
  }

  return data.candidates[0].content.parts[0].text;
}

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

    return await callGemini(prompt);

  } catch (err) {
    console.error("GEMINI CHAT ERROR:", err);
    throw new Error("Failed to process chat request");
  }
};

/* ---------------- SUMMARY ---------------- */

export const generateSummary = async (text) => {
  try {
    const prompt = `
Summarize the following text clearly and concisely:

${text.slice(0, 8000)}
`;
    return await callGemini(prompt);
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    throw err;
  }
};

/* ---------------- FLASHCARDS ---------------- */

export const generateFlashcards = async (text, count = 10) => {
  try {
    const prompt = `
Create ${count} flashcards from the text below.

Format strictly as:
Q:
A:

Text:
${text.slice(0, 8000)}
`;
    return await callGemini(prompt);
  } catch (err) {
    console.error("FLASHCARD ERROR:", err);
    throw err;
  }
};

/* ---------------- QUIZ ---------------- */

export const generateQuiz = async (text, count = 5) => {
  try {
    const prompt = `
Create ${count} multiple choice questions (MCQs) from the text.

Each question should have 4 options and mark the correct answer.

Text:
${text.slice(0, 8000)}
`;
    return await callGemini(prompt);
  } catch (err) {
    console.error("QUIZ ERROR:", err);
    throw err;
  }
};

/* ---------------- EXPLAIN CONCEPT ---------------- */

export const explainConcept = async (concept, context) => {
  try {
    const prompt = `
Explain the concept "${concept}" using the context below in simple terms:

${context.slice(0, 8000)}
`;
    return await callGemini(prompt);
  } catch (err) {
    console.error("EXPLAIN ERROR:", err);
    throw err;
  }
};
