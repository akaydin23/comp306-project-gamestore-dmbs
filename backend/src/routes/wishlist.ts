import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  addToWishlist,
  getWishlist,
  getWishlistIds,
  removeFromWishlist,
} from '../controllers/wishlistController.js';

const router = Router();

router.get('/', authMiddleware, getWishlist);
router.get('/ids', authMiddleware, getWishlistIds);
router.post('/items', authMiddleware, addToWishlist);
router.delete('/items/:gameId', authMiddleware, removeFromWishlist);

export default router;
