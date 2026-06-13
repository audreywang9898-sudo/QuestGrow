import express from 'express';
import { registerParent, login, googleLogin, linkGoogleAccount, getAuthConfig, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/config', getAuthConfig);
router.get('/me', authenticateToken, getMe);
router.post('/register', registerParent);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/link-google', authenticateToken, linkGoogleAccount);

export default router;
