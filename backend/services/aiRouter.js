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

/* ---------------- FALLBACK WRAPPER ---------------- */

const executeWithFallback = async (functionName, ...args) => {
    try {
        console.log(`[AI ROUTER] Trying Gemini for ${functionName}...`);
        return await geminiService[functionName](...args);
    } catch (geminiError) {
        console.warn(`[AI ROUTER] Gemini failed for ${functionName}:`, geminiError.message);

        if (isRateLimitOrCriticalError(geminiError)) {
            console.warn(`[AI ROUTER] Rate limit/critical error detected. Falling back to Groq...`);
            try {
                return await groqService[functionName](...args);
            } catch (groqError) {
                console.error(`[AI ROUTER] Groq fallback ALSO failed:`, groqError.message);
                console.warn(`[AI ROUTER] Falling back to OpenAI...`);
                try {
                    return await openAiService[functionName](...args);
                } catch (openAiError) {
                    console.error(`[AI ROUTER] OpenAI fallback ALSO failed:`, openAiError.message);
                    throw openAiError; // Throw the ultimate failure back to the controller
                }
            }
        }

        // If it wasn't a rate limit (e.g., bad request context), throw the original Gemini error
        throw geminiError;
    }
};

/* ---------------- EXPORTS ---------------- */

export const chatWithContext = (...args) => executeWithFallback('chatWithContext', ...args);
export const generateSummary = (...args) => executeWithFallback('generateSummary', ...args);
export const generateFlashcards = (...args) => executeWithFallback('generateFlashcards', ...args);
export const generateQuiz = (...args) => executeWithFallback('generateQuiz', ...args);
export const explainConcept = (...args) => executeWithFallback('explainConcept', ...args);
