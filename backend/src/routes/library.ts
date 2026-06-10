import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { getLibrary } from '../controllers/libraryController.js';

const router = Router();

router.get('/', authMiddleware, getLibrary);

export default router;
