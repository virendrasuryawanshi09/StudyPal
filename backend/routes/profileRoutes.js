import express from 'express';
import { getProfileAnalytics } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', protect, getProfileAnalytics);

export default router;
