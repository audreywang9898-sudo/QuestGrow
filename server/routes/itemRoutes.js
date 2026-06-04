import express from 'express';
import { getInventory, getRedeemLogs, drawGachaCard, requestRedeem, reviewRedeem } from '../controllers/itemController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/inventory', authenticateToken, getInventory);
router.get('/redeem-logs', authenticateToken, getRedeemLogs);
router.post('/gacha', authenticateToken, drawGachaCard);
router.post('/inventory/:inventoryId/redeem-request', authenticateToken, requestRedeem);
router.post('/inventory/:inventoryId/redeem-review', authenticateToken, requireRole('parent'), reviewRedeem);

export default router;
