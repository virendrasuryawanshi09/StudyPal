import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title for the quiz'],
        trim: true,
    },
    questions: [{
        options: {
            type: [String],
            required: [true, 'Please add options for the quiz'],
            validate: [arrayLimit, 'A quiz must have at least two options'],
        },
        correctAnswer: {
            type: String,
            required: [true, 'Please add the correct answer for the quiz'],
        },
        explanation: {
            type: String,
            default: null,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
    }],
    userAnswers: [{
        questionIndex: {
            type: Number,
            required: true,
        },
        selectedAnswer: {
            type: String,
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
        answeredAt: {
            type: Date,
            default: Date.now,
        },
    }],
    score: {
        type: Number,
        default: 0,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    completedAt: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
});

quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
