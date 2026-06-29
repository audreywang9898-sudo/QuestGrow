import express from 'express';
import { registerParent, login, googleLogin, lineLogin, linkGoogleAccount, getAuthConfig, getMe, completeOnboarding } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/config', getAuthConfig);
router.get('/me', authenticateToken, getMe);
router.post('/register', registerParent);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/line', lineLogin);
router.post('/link-google', authenticateToken, linkGoogleAccount);
router.post('/complete-onboarding', authenticateToken, completeOnboarding);

export default router;
