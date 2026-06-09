import { Request, Response, NextFunction } from 'express';
import * as gamesService from '../services/gamesService.js';

export const getGames = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const genre = typeof req.query.genre === 'string' ? req.query.genre : undefined;
    const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;

    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    if (minPrice !== undefined && !Number.isFinite(minPrice)) {
      res.status(400).json({ error: { message: 'minPrice must be a number' } });
      return;
    }

    if (maxPrice !== undefined && !Number.isFinite(maxPrice)) {
      res.status(400).json({ error: { message: 'maxPrice must be a number' } });
      return;
    }

    if (minPrice !== undefined && minPrice < 0) {
      res.status(400).json({ error: { message: 'minPrice cannot be negative' } });
      return;
    }

    if (maxPrice !== undefined && maxPrice < 0) {
      res.status(400).json({ error: { message: 'maxPrice cannot be negative' } });
      return;
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      res.status(400).json({ error: { message: 'minPrice cannot be greater than maxPrice' } });
      return;
    }

    const games = await gamesService.getGames({
      search,
      genre,
      minPrice,
      maxPrice,
      sort,
    });

    res.json({ games });
  } catch (err) {
    next(err);
  }
};

export const getGameById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gameId = Number(req.params.id);

    if (!Number.isInteger(gameId) || gameId <= 0) {
      res.status(400).json({ error: { message: 'game id must be a positive integer' } });
      return;
    }

    const game = await gamesService.getGameById(gameId);
    res.json({ game });
  } catch (err) {
    next(err);
  }
};
