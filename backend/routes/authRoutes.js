import express from 'express';
import { body } from 'express-validator';
import { 
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

//validation

const registerValidation = [    
    body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
    body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
    body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Public routes

router