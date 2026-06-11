import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import { getFriends, getPendingRequests, sendRequest, acceptRequest } from '../controllers/friendsController.js';

const router = Router();

router.get('/', authMiddleware, getFriends);
router.get('/pending', authMiddleware, getPendingRequests);
router.post('/requests', authMiddleware, sendRequest);
router.post('/requests/accept/:senderId', authMiddleware, acceptRequest);

export default router;