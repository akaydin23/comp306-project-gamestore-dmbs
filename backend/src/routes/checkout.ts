import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { checkout } from '../controllers/checkoutController.js';

const router = Router();

router.post('/', authMiddleware, checkout);

export default router;
