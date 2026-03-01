import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";



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
        ],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    }
  );

  const data = await res.json();

  if (data.error) {
    console.error("GEMINI API ERROR:", data.error);
    throw new Error(data.error.message || "Gemini API Error");
  }

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
Q: [Question]
A: [Answer]

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
Return ONLY a valid JSON array of objects.
Each object must have the exact following structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The exact string of the correct option",
  "explanation": "A short explanation of why it is correct",
  "difficulty": "medium"
}

Text:
${text.slice(0, 8000)}
`;
    const resString = await callGemini(prompt);

    // Attempt to clean and parse the response
    let cleanedString = resString.trim();

    // Sometimes Gemini still wraps in code blocks even if told not to
    if (cleanedString.includes("```")) {
      const match = cleanedString.match(/```(?:json)?([\s\S]*?)```/);
      if (match) {
        cleanedString = match[1].trim();
      }
    }

    try {
      return JSON.parse(cleanedString);
    } catch (parseError) {
      console.error("JSON PARSE ERROR. Raw string:", resString);
      throw new Error("Failed to parse quiz JSON from AI response");
    }
  } catch (err) {
    console.error("QUIZ GENERATION ERROR:", err);
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
