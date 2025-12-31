import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
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
    cards: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        question: {
          type: String,
          required: [true, 'Please add a question for the flashcard'],
          trim: true,
        },
        answer: {
          type: String,
          required: [true, 'Please add an answer for the flashcard'],
          trim: true,
        },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
        lastReviewed: {
          type: Date,
          default: null,
        },
        reviewCount: {
          type: Number,
          default: 0,
        },
        isStarred: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);


flashcardSchema.index(
  { userId: 1, documentId: 1 },
  { unique: true }
);

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
export default Flashcard;
