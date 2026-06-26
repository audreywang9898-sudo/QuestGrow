import express from 'express';
import { 
  submitFeedback, 
  getFeedbacks, 
  updateFeedbackStatus, 
  deleteFeedback,
  getFeedbackSummaries,
  generateDailySummary
} from '../controllers/feedbackController.js';
import { 
  authenticateToken, 
  optionalAuthenticateToken, 
  requireRole 
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Optional Logged-in submission
router.post('/', optionalAuthenticateToken, submitFeedback);

// Admin-only endpoints
router.get('/', authenticateToken, requireRole('admin'), getFeedbacks);
router.get('/summary', authenticateToken, requireRole('admin'), getFeedbackSummaries);
router.post('/summary/generate', authenticateToken, requireRole('admin'), generateDailySummary);
router.put('/:id', authenticateToken, requireRole('admin'), updateFeedbackStatus);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteFeedback);

export default router;
