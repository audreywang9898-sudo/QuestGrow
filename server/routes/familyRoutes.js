import express from 'express';
import { 
  getFamilyData, getWishlist, addWishlistItem, editWishlistItem, deleteWishlistItem, redeemWishlist,
  getParentGoals, addParentGoal, updateGoalProgress, deleteParentGoal, getWeeklyComp, getEventLogs, addEventLog
} from '../controllers/familyController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getFamilyData);

// Wishlist
router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist', authenticateToken, requireRole('parent'), addWishlistItem);
router.put('/wishlist/:id', authenticateToken, requireRole('parent'), editWishlistItem);
router.delete('/wishlist/:id', authenticateToken, requireRole('parent'), deleteWishlistItem);
router.post('/wishlist/:id/redeem', authenticateToken, redeemWishlist);

// Parent Goals
router.get('/goals', authenticateToken, getParentGoals);
router.post('/goals', authenticateToken, requireRole('parent'), addParentGoal);
router.put('/goals/:id/progress', authenticateToken, requireRole('parent'), updateGoalProgress);
router.delete('/goals/:id', authenticateToken, requireRole('parent'), deleteParentGoal);

// Weekly Competition
router.get('/weekly-comp', authenticateToken, getWeeklyComp);

// Event Logs
router.get('/event-logs', authenticateToken, getEventLogs);
router.post('/event-logs', authenticateToken, addEventLog);

export default router;
