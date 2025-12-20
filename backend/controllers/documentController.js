import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF, extractTextFromWord} from '../utils/textExtractor.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs';
import mongoose from 'mongoose';