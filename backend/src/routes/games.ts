import { Router } from 'express';
import { getGameById, getGames } from '../controllers/gamesController.js';

const router: Router = Router();

router.get('/', getGames);
router.get('/:id', getGameById);

export default router;
