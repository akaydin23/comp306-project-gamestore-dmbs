import { Request, Response, NextFunction } from 'express';
import * as giftsService from '../services/giftsService.js';

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export const getReceivedGifts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gifts = await giftsService.getReceivedGifts(req.user!.user_id);
    res.json({ gifts });
  } catch (err) {
    next(err);
  }
};

export const getSentGifts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gifts = await giftsService.getSentGifts(req.user!.user_id);
    res.json({ gifts });
  } catch (err) {
    next(err);
  }
};

export const sendGift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const recipientUsername = typeof req.body.recipient_username === 'string'
      ? req.body.recipient_username.trim()
      : '';
    const gameId = parsePositiveInt(req.body.game_id);
    const message = typeof req.body.gift_message === 'string' && req.body.gift_message.trim() !== ''
      ? req.body.gift_message.trim()
      : null;

    if (!recipientUsername || !gameId) {
      res.status(400).json({
        error: { message: 'recipient_username and game_id are required' },
      });
      return;
    }

    const gift = await giftsService.sendGift(
      req.user!.user_id,
      recipientUsername,
      gameId,
      message,
    );
    res.status(201).json({ gift });
  } catch (err) {
    next(err);
  }
};

export const acceptGift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const giftId = parsePositiveInt(req.params.giftId);

    if (!giftId) {
      res.status(400).json({ error: { message: 'giftId must be a positive integer' } });
      return;
    }

    const gift = await giftsService.acceptGift(req.user!.user_id, giftId);
    res.json({ gift });
  } catch (err) {
    next(err);
  }
};

export const rejectGift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const giftId = parsePositiveInt(req.params.giftId);

    if (!giftId) {
      res.status(400).json({ error: { message: 'giftId must be a positive integer' } });
      return;
    }

    await giftsService.rejectGift(req.user!.user_id, giftId);
    res.json({ message: 'Gift rejected' });
  } catch (err) {
    next(err);
  }
};

export const cancelGift = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const giftId = parsePositiveInt(req.params.giftId);

    if (!giftId) {
      res.status(400).json({ error: { message: 'giftId must be a positive integer' } });
      return;
    }

    await giftsService.cancelGift(req.user!.user_id, giftId);
    res.json({ message: 'Gift cancelled' });
  } catch (err) {
    next(err);
  }
};
