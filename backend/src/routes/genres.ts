import { Router } from 'express';
import { getGenres } from '../controllers/genresController.js';

const router: Router = Router();

router.get('/', getGenres);

export default router;
