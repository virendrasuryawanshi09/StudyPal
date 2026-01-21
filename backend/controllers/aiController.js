import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

/* ---------------------- FLASHCARDS ---------------------- */

export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }

        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            Number(count)
        );

        if (!cards || cards.length === 0) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate flashcards',
            });
        }

        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false,
            })),
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ---------------------- QUIZ ---------------------- */

export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }

        const questions = await geminiService.generateQuiz(
            document.extractedText,
            Number(numQuestions)
        );

        if (!questions || questions.length === 0) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate quiz',
            });
        }

        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0,
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ---------------------- SUMMARY ---------------------- */

export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
            });
        }

        const summary = await geminiService.generateSummary(
            document.extractedText
        );

        if (!summary) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate summary',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary,
            },
            message: 'Summary generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ---------------------- CHAT ---------------------- */

export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and question',
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
            });
        }

        // ✅ HARD GUARANTEE CONTEXT EXISTS
        const baseText =
            document.extractedText && document.extractedText.trim().length > 0
                ? document.extractedText
                : 'No document content available.';

        const chunks = Array.isArray(document.chunks) && document.chunks.length > 0
            ? document.chunks
            : [{ chunkIndex: 0, content: baseText }];

        let relevantChunks = findRelevantChunks(chunks, question, 3);

        if (!relevantChunks || relevantChunks.length === 0) {
            relevantChunks = chunks.slice(0, 1);
        }

        // 🔥 LOG ONCE (DEBUG)
        console.log('CHAT QUESTION:', question);
        console.log('CHAT CONTEXT LENGTH:', relevantChunks[0].content.length);

        const answer = await geminiService.chatWithContext(
            question,
            relevantChunks
        );

        res.status(200).json({
            success: true,
            data: { question, answer },
            message: 'Response generated successfully',
        });
    } catch (error) {
        console.error('CHAT CONTROLLER ERROR:', error.message);
        next(error);
    }
};


/* ---------------------- EXPLAIN CONCEPT ---------------------- */

export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and concept',
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
            });
        }

        const chunks =
            Array.isArray(document.chunks) && document.chunks.length > 0
                ? document.chunks
                : [
                      {
                          chunkIndex: 0,
                          content: document.extractedText,
                      },
                  ];

        let relevantChunks = findRelevantChunks(chunks, concept, 3);

        if (!relevantChunks || relevantChunks.length === 0) {
            relevantChunks = chunks.slice(0, 3);
        }

        const context = relevantChunks.map(c => c.content).join('\n\n');

        const explanation = await geminiService.explainConcept(
            concept,
            context
        );

        if (!explanation) {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate explanation',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex),
            },
            message: 'Explanation generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ---------------------- CHAT HISTORY ---------------------- */

export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
            });
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId,
        }).select('messages');

        res.status(200).json({
            success: true,
            data: chatHistory ? chatHistory.messages : [],
            message: 'Chat history retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
};
