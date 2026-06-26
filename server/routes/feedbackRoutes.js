import express from 'express';
import { 
  submitFeedback, 
  getFeedbacks, 
  updateFeedbackStatus, 
  deleteFeedback 
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
router.put('/:id', authenticateToken, requireRole('admin'), updateFeedbackStatus);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteFeedback);

export default router;
