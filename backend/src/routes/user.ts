import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { updateProfile, searchUsers } from '../controllers/userController.js';

const router = Router();

router.put('/profile', authMiddleware, updateProfile);
router.get('/search', authMiddleware, searchUsers);

export default router;