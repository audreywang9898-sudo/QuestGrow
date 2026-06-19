import express from 'express';
import { getDailyProverb } from '../controllers/proverbController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/daily', authenticateToken, getDailyProverb);

export default router;
