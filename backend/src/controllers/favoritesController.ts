import { Request, Response, NextFunction } from 'express';
import * as favoritesService from '../services/favoritesService.js';

function parseGameId(value: unknown): number | null {
  const gameId = Number(value);
  return Number.isInteger(gameId) && gameId > 0 ? gameId : null;
}

export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const games = await favoritesService.getFavorites(req.user!.user_id);
    res.json({ games });
  } catch (err) {
    next(err);
  }
};

export const getFavoriteIds = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const game_ids = await favoritesService.getFavoriteIds(req.user!.user_id);
    res.json({ game_ids });
  } catch (err) {
    next(err);
  }
};

export const addToFavorites = async (
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

    await favoritesService.addToFavorites(req.user!.user_id, gameId);
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    next(err);
  }
};

export const removeFromFavorites = async (
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

    await favoritesService.removeFromFavorites(req.user!.user_id, gameId);
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
};
