import mongoose from 'mongoose';
import Quiz from './models/Quiz.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const quiz = await Quiz.findOne().sort({ createdAt: -1 });
        if (quiz) {
            console.log('--- LATEST QUIZ QUESTION 0 ---');
            console.log(JSON.stringify(quiz.questions[0], null, 2));
        } else {
            console.log('No quizzes found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
