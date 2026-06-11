import { Router } from 'express';
import {getGameById, getGames, searchGames } from '../controllers/gamesController.js';

const router: Router = Router();

router.get('/', getGames);
router.get('/search', searchGames);
router.get('/:id', getGameById);

export default router;
