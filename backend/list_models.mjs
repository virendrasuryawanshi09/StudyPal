import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
const listData = await listRes.json();

if (listData.error) {
    console.error("Error:", JSON.stringify(listData.error));
    process.exit(1);
}

console.log("Models with generateContent support:");
listData.models
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .forEach(m => console.log(m.name));
