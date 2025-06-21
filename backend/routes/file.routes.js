import express from 'express';
import { uploadMiddleware, handleFileUpload } from '../services/fileUpload.js';

const router = express.Router();

// Upload file route
router.post('/upload', uploadMiddleware, handleFileUpload);

export default router; 