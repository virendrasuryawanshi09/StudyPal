import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: "c:/StudyPal/backend/.env" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Testing with the current URL in the codebase
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

async function testGemini() {
    console.log("Using API Key:", GEMINI_API_KEY ? "EXISTS" : "MISSING");
    console.log("Using URL:", GEMINI_URL);

    try {
        const res = await fetch(
            `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: "Hello, this is a test from StudyPal." }]
                        }
                    ]
                })
            }
        );

        const data = await res.json();
        console.log("GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("TEST ERROR:", err);
    }
}

testGemini();
