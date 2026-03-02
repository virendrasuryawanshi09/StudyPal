import dotenv from 'dotenv';
dotenv.config();
import * as geminiService from './utils/geminiService.js';

async function test() {
    try {
        console.log('Testing Gemini Service...');
        const res = await geminiService.explainConcept('Recursion', 'Recursion is a process in which a function calls itself.');
        console.log('Response:', res);
    } catch (err) {
        console.error('Test Failed:', err);
    }
}

test();
