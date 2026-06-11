import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  addToFavorites,
  getFavoriteIds,
  getFavorites,
  removeFromFavorites,
} from '../controllers/favoritesController.js';

const router = Router();

router.get('/', authMiddleware, getFavorites);
router.get('/ids', authMiddleware, getFavoriteIds);
router.post('/items', authMiddleware, addToFavorites);
router.delete('/items/:gameId', authMiddleware, removeFromFavorites);

export default router;
