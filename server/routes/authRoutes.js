import express from 'express';
import { registerParent, login, googleLogin, lineLogin, linkGoogleAccount, getAuthConfig, getMe, completeOnboarding, linkLineAccount, unlinkLineAccount, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/config', getAuthConfig);
router.get('/me', authenticateToken, getMe);
router.post('/register', registerParent);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/line', lineLogin);
router.post('/logout', authenticateToken, logout);
router.post('/link-google', authenticateToken, linkGoogleAccount);
router.post('/link-line', authenticateToken, linkLineAccount);
router.post('/unlink-line', authenticateToken, unlinkLineAccount);
router.post('/complete-onboarding', authenticateToken, completeOnboarding);

export default router;
