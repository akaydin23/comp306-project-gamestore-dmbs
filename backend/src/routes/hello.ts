import { Router } from 'express';
import { getHello } from '../controllers/helloController.js';

const router: Router = Router();

router.get('/', getHello);

export default router;
