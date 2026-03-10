import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../services/aiRouter.js';
import { findRelevantChunks } from '../services/textChunker.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logError = (type, error) => {
    const logMsg = `[${new Date().toISOString()}] ${type}: ${error.stack || error}\n`;
    const logPath = path.join(__dirname, '..', 'backend_errors.log');
    try {
        fs.appendFileSync(logPath, logMsg);
    } catch (e) {
        console.error('Failed to write to log file', e);
    }
};

const handleAiError = (res, type, error) => {
    logError(type, error);
    if (error.message?.toLowerCase().includes("quota exceeded") || error.message?.includes("429")) {
        return res.status(429).json({ success: false, error: "AI Limit Reached. Please wait a minute before trying again." });
    }
    return res.status(500).json({ success: false, error: error.message || "An unexpected AI error occurred." });
};

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

        let cards = await geminiService.generateFlashcards(
            document.extractedText,
            Number(count)
        );

        if (typeof cards === "string") {
            const flashcardsArray = [];
            const blocks = cards.split("\n\n");
            for (let block of blocks) {
                const questionMatch = block.match(/Q:\s*(.*)/);
                const answerMatch = block.match(/A:\s*(.*)/);
                if (questionMatch && answerMatch) {
                    flashcardsArray.push({
                        question: questionMatch[1].trim(),
                        answer: answerMatch[1].trim(),
                        difficulty: "medium",
                        reviewCount: 0,
                        isStarred: false,
                    });
                }
            }
            cards = flashcardsArray;
        }

        if (!Array.isArray(cards) || cards.length === 0) {
            return res.status(500).json({
                success: false,
                error: "Failed to generate valid flashcards",
            });
        }

        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty || "medium",
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
        return handleAiError(res, 'FLASHCARD ERROR', error);
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

        const normalizedQuestions = questions.map(q => {
            const text = q.question || q.Question || q.text || q.q || "";
            return {
                ...q,
                question: text.trim() ? text.trim() : "Question text missing (AI Generation Error)",
                options: q.options || q.Options || [],
                correctAnswer: q.correctAnswer || q.CorrectAnswer || q.answer || q.Answer || "",
                explanation: q.explanation || q.Explanation || "",
                difficulty: q.difficulty || "medium"
            };
        });

        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: normalizedQuestions,
            totalQuestions: normalizedQuestions.length,
            userAnswers: [],
            score: 0,
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully',
        });
    } catch (error) {
        return handleAiError(res, 'QUIZ ERROR', error);
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
        return handleAiError(res, 'SUMMARY ERROR', error);
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
        return handleAiError(res, 'CHAT ERROR', error);
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
        return handleAiError(res, 'EXPLAIN ERROR', error);
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
        logError('CHAT HISTORY ERROR', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
