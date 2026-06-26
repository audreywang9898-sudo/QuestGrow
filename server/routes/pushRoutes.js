import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import pool from '../config/db.js';

const router = express.Router();

// 1. Subscribe to push notifications
router.post('/subscribe', authenticateToken, async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.id; // UUID from token

  if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    return res.status(400).json({ message: '無效的訂閱資訊。' });
  }

  try {
    // Insert or update subscription details
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) 
       DO UPDATE SET user_id = $1, p256dh = $3, auth = $4`,
      [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );

    res.status(201).json({ message: '訂閱成功。' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ message: '伺服器錯誤，無法儲存推播訂閱。' });
  }
});

// 2. Unsubscribe
router.post('/unsubscribe', authenticateToken, async (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ message: '缺少訂閱終端 (endpoint) 資訊。' });
  }

  try {
    await pool.query(
      'DELETE FROM push_subscriptions WHERE endpoint = $1',
      [endpoint]
    );
    res.json({ message: '已成功取消訂閱。' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ message: '伺服器錯誤，無法取消訂閱。' });
  }
});

// 3. Get VAPID public key
router.get('/key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(404).json({ message: 'VAPID public key not found.' });
  }
  res.json({ publicKey });
});

export default router;

