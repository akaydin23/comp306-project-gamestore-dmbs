import { Router } from 'express';
import helloRouter from './hello.js';

const router: Router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/hello', helloRouter);

export default router;
