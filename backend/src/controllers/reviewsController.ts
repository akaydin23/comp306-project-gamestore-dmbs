import { Request, Response, NextFunction } from 'express';
import * as reviewsService from '../services/reviewsService.js';

function parseGameId(value: unknown): number | null {
  const gameId = Number(value);
  return Number.isInteger(gameId) && gameId > 0 ? gameId : null;
}

export const getGameReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gameId = parseGameId(req.params.gameId);

    if (!gameId) {
      res.status(400).json({ error: { message: 'gameId must be a positive integer' } });
      return;
    }

    const reviews = await reviewsService.getGameReviews(gameId);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

export const upsertReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gameId = parseGameId(req.params.gameId);
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : null;

    if (!gameId) {
      res.status(400).json({ error: { message: 'gameId must be a positive integer' } });
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: { message: 'rating must be an integer between 1 and 5' } });
      return;
    }

    const review = await reviewsService.upsertReview(
      req.user!.user_id,
      gameId,
      rating,
      comment || null,
    );
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gameId = parseGameId(req.params.gameId);

    if (!gameId) {
      res.status(400).json({ error: { message: 'gameId must be a positive integer' } });
      return;
    }

    await reviewsService.deleteReview(req.user!.user_id, gameId);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
