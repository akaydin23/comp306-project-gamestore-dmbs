import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { getCart, addItem, removeItem, clearCart } from '../controllers/cartController.js';

const router = Router();

router.get('/', authMiddleware, getCart);
router.post('/items', authMiddleware, addItem);
router.delete('/items/:gameId', authMiddleware, removeItem);
router.delete('/', authMiddleware, clearCart);

export default router;
