import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import developerMiddleware from '../middleware/developer.js';
import {
  createDeveloperGame,
  deleteDeveloperGame,
  getDeveloperGames,
  updateDeveloperGame,
} from '../controllers/developerController.js';

const router = Router();

router.use(authMiddleware, developerMiddleware);

router.get('/games', getDeveloperGames);
router.post('/games', createDeveloperGame);
router.put('/games/:gameId', updateDeveloperGame);
router.delete('/games/:gameId', deleteDeveloperGame);

export default router;
