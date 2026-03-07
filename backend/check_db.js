import mongoose from 'mongoose';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import Quiz from './models/Quiz.js';
import fs from 'fs';

dotenv.config();

async function check() {
    await connectDB();
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(1);
    if (quizzes.length > 0) {
        fs.writeFileSync('db_out.json', JSON.stringify(quizzes[0].questions[0], null, 2), 'utf8');
    }
    process.exit(0);
}

check();
