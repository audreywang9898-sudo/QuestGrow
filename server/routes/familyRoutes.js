import express from 'express';
import {
  getFamilyData, getWishlist, addWishlistItem, editWishlistItem, deleteWishlistItem, redeemWishlist, reviewWishlistRedeem,
  getParentGoals, addParentGoal, updateGoalProgress, deleteParentGoal, getWeeklyComp, getEventLogs, addEventLog,
  updateFamilyGachaPool, updateFamilySettings, updateFamilyNickname, getFamilyLeaderboard
} from '../controllers/familyController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getFamilyData);
router.put('/gacha-pool', authenticateToken, requireRole('parent'), updateFamilyGachaPool);
router.put('/settings', authenticateToken, requireRole('parent'), updateFamilySettings);
router.put('/nickname', authenticateToken, requireRole('parent'), updateFamilyNickname);
router.get('/leaderboard', authenticateToken, getFamilyLeaderboard);

// Wishlist
router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist', authenticateToken, requireRole('parent'), addWishlistItem);
router.put('/wishlist/:id', authenticateToken, requireRole('parent'), editWishlistItem);
router.delete('/wishlist/:id', authenticateToken, requireRole('parent'), deleteWishlistItem);
router.post('/wishlist/:id/redeem', authenticateToken, redeemWishlist);
router.post('/wishlist/:id/redeem-review', authenticateToken, requireRole('parent'), reviewWishlistRedeem);

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
