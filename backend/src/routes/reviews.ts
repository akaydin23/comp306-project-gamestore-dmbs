import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  deleteReview,
  getGameReviews,
  upsertReview,
} from '../controllers/reviewsController.js';

const router = Router();

router.get('/games/:gameId', getGameReviews);
router.put('/games/:gameId/me', authMiddleware, upsertReview);
router.delete('/games/:gameId/me', authMiddleware, deleteReview);

export default router;
