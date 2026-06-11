import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  acceptGift,
  cancelGift,
  getReceivedGifts,
  getSentGifts,
  rejectGift,
  sendGift,
} from '../controllers/giftsController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getReceivedGifts);
router.get('/sent', getSentGifts);
router.post('/', sendGift);
router.post('/:giftId/accept', acceptGift);
router.post('/:giftId/reject', rejectGift);
router.post('/:giftId/cancel', cancelGift);

export default router;
