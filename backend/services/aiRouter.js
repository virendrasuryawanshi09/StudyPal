import * as geminiService from "./geminiService.js";
import * as groqService from "./groqService.js";
import * as openAiService from "./openAiService.js";

// Helper to check if an error should trigger a fallback
const isRateLimitOrCriticalError = (error) => {
    const msg = error.message?.toLowerCase() || "";
    // Check for 429 status, or common rate limit phrases
    if (error.status === 429 || msg.includes("quota") || msg.includes("exhausted") || msg.includes("429")) {
        return true;
    }
    // Also fallback on 500/503 if Gemini is totally down, but not for generic bad requests
    if (error.status >= 500 || msg.includes("internal") || msg.includes("timeout")) {
        return true;
    }
    return false;
};

const executeWithFallback = async (functionName, ...args) => {
    try {
        // Groq is blazing fast, so we try it first
        return await groqService[functionName](...args);
    } catch (groqError) {
        console.warn(`[AI ROUTER] Groq failed for ${functionName}:`, groqError.message);
        console.log(`[AI ROUTER] Falling back to Gemini...`);
        try {
            return await geminiService[functionName](...args);
        } catch (geminiError) {
            console.warn(`[AI ROUTER] Gemini ALSO failed:`, geminiError.message);
            console.warn(`[AI ROUTER] Falling back to OpenAI...`);
            try {
                return await openAiService[functionName](...args);
            } catch (openAiError) {
                console.error(`[AI ROUTER] OpenAI fallback ALSO failed:`, openAiError.message);
                throw openAiError; // Throw the ultimate failure
            }
        }
    }
};

/* ---------------- EXPORTS ---------------- */

export const chatWithContext = (...args) => executeWithFallback('chatWithContext', ...args);
export const generateSummary = (...args) => executeWithFallback('generateSummary', ...args);
export const generateFlashcards = (...args) => executeWithFallback('generateFlashcards', ...args);
export const generateQuiz = (...args) => executeWithFallback('generateQuiz', ...args);
export const explainConcept = (...args) => executeWithFallback('explainConcept', ...args);
