import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateToken, requireRole('admin'), getAdminStats);

export default router;
