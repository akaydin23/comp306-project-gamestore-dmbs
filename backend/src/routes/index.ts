import { Router } from 'express';
import helloRouter from './hello.js';
import authRouter from './auth.js';
import gamesRouter from './games.js';
import genresRouter from './genres.js';
import userRoutes from './user.js';
import libraryRouter from './library.js';

const router: Router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/hello', helloRouter);
router.use('/auth', authRouter);
router.use('/games', gamesRouter);
router.use('/genres', genresRouter);
router.use('/users', userRoutes);
router.use('/library', libraryRouter);

export default router;