import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/Quiz.js';
import User from './models/User.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'alex@gmail.com' });
        if (!user) {
            console.log("no user"); return process.exit(0);
        }

        const quizzes = await Quiz.find({ userId: user._id }).sort({ createdAt: -1 }).limit(1);

        if (quizzes.length === 0) {
            console.log("No quizzes for user Alex");
        } else {
            const q = quizzes[0];
            console.log("Found quiz:", q._id);
            console.log("CompletedAt:", q.completedAt);
            console.log("Questions length:", q.questions.length);
            console.log("UserAnswers length:", q.userAnswers.length);

            // Let's print out what `getQuizResults` sends
            const detailedResults = q.questions.map((question, index) => {
                const userAnswer = q.userAnswers.find(a => a.questionIndex === index);
                return {
                    questionIndex: index,
                    question: question.question,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    selectedAnswer: userAnswer?.selectedAnswer || null,
                    isCorrect: userAnswer?.isCorrect || false,
                    explanation: question.explanation
                };
            });
            console.log("Detailed Results length:", detailedResults.length);
            if (detailedResults.length > 0) {
                console.log("Sample Detailed Result 0:", JSON.stringify(detailedResults[0], null, 2));
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
