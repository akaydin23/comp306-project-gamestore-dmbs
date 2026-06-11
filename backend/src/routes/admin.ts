import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';
import {
  createGame,
  createGenre,
  deleteGame,
  deleteGenre,
  getPurchases,
  getStats,
  getUsers,
  updateGame,
  updateGenre,
} from '../controllers/adminController.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/purchases', getPurchases);

router.post('/games', createGame);
router.put('/games/:gameId', updateGame);
router.delete('/games/:gameId', deleteGame);

router.post('/genres', createGenre);
router.put('/genres/:genreId', updateGenre);
router.delete('/genres/:genreId', deleteGenre);

export default router;
