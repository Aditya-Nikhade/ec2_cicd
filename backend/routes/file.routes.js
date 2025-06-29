import express from 'express';
import { uploadMiddleware, uploadFile } from '../controllers/upload.controller.js';

const router = express.Router();

// Upload file route
router.post('/upload', uploadMiddleware, uploadFile);

export default router;