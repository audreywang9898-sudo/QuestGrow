import express from 'express';
import { 
  getFamilyUsers, getChildren, addChild, deleteChild, 
  updateChildProfile, addParent, deleteParent, updateParent, clearAllFamilyData 
} from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/members', authenticateToken, getFamilyUsers);
router.get('/children', authenticateToken, getChildren);

router.post('/children', authenticateToken, requireRole('parent'), addChild);
router.delete('/children/:childId', authenticateToken, requireRole('parent'), deleteChild);
router.put('/children/:childId', authenticateToken, updateChildProfile);

router.post('/parents', authenticateToken, requireRole('parent'), addParent);
router.delete('/parents/:parentEmail', authenticateToken, requireRole('parent'), deleteParent);
router.put('/parents', authenticateToken, requireRole('parent'), updateParent);

router.delete('/family/clear', authenticateToken, requireRole('parent'), clearAllFamilyData);

export default router;
