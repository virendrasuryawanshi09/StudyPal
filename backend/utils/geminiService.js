import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if(!process.env.GEMINI_API_KEY) {
    console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
    process.exit(1);
}

export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate exactly ${count} educational flashcards from the following text
    Format each flashcard as: 
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]
    
    Seprate each flashcard with"---
    
    Text: 
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        const generatedText = response.text;

        const flashcards = [];
        const cards = generatedText.split('---').filter(c => c.trim());
        for(const card of cards) {
            const lines = card.trim().split('\n');
            let question = '', answer = '', difficulty = 'medium';

            for(const line of lines) {
                if(line.startsWith('Q:')) {
                    question = line.substring(2).trim();

                }else if(line.startsWith('A:')){
                    answer = line.substring(2).trim();
                }else if(line.startsWith('D:')){
                    const diff = line.substring(2).trim().toLowerCase();
                    if(['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if(question && answer) {
                flashcards.push({question, answer, difficulty});
            }
        }
        return flashcards.slice(0, count);
    }catch (error) {
        console.error('Gemini API error', error);
        throw new Error('Failed to generate flashcards');
    }
    
}