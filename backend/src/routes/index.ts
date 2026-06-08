import { Router } from 'express';
import helloRouter from './hello.js';
import authRouter from './auth.js';

const router: Router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/hello', helloRouter);
router.use('/auth', authRouter);

export default router;
