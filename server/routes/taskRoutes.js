import express from 'express';
import { getTasks, addTask, editTask, deleteTask, clearAllTasks, submitTask, reviewTask } from '../controllers/taskController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getTasks);
router.post('/', authenticateToken, addTask);
router.put('/:taskId', authenticateToken, requireRole('parent'), editTask);
router.delete('/:taskId', authenticateToken, requireRole('parent'), deleteTask);
router.delete('/', authenticateToken, requireRole('parent'), clearAllTasks);

router.post('/:taskId/submit', authenticateToken, submitTask);
router.post('/:taskId/review', authenticateToken, requireRole('parent'), reviewTask);

export default router;
