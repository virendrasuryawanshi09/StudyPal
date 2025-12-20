import express from 'express';
import {
   uploadDocument,
   getDocuments,
   deleteDocument,
   getDocument,
    updateDocument,
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';    
import upload from '../middleware/upload.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
router.put('/:id', updateDocument);


export default router;