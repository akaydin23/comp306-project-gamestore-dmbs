import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { updateProfile } from '../controllers/userController.js';

const router = Router();

//Makes like a request to change the profile
//First verifies users loggin with authMiddleware 
//Then updates profile with updateProfile
router.put('/me', authMiddleware, updateProfile);
export default router;