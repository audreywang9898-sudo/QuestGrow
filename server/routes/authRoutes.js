import express from 'express';
import { registerParent, login, googleLogin, linkGoogleAccount } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerParent);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/link-google', authenticateToken, linkGoogleAccount);

export default router;
