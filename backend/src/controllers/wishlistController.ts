import { Request, Response, NextFunction } from 'express';
import * as wishlistService from '../services/wishlistService.js';

function parseGameId(value: unknown): number | null {
  const gameId = Number(value);
  return Number.isInteger(gameId) && gameId > 0 ? gameId : null;
}

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const games = await wishlistService.getWishlist(req.user!.user_id);
    res.json({ games });
  } catch (err) {
    next(err);
  }
};

export const getWishlistIds = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const game_ids = await wishlistService.getWishlistIds(req.user!.user_id);
    res.json({ game_ids });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gameId = parseGameId(req.body.game_id);

    if (!gameId) {
      res.status(400).json({ error: { message: 'game_id must be a positive integer' } });
      return;
    }

    await wishlistService.addToWishlist(req.user!.user_id, gameId);
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (
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

    await wishlistService.removeFromWishlist(req.user!.user_id, gameId);
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};
