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
      res.status(400).json({ error: { message: 'minimum price must be a number' } });
      return;
    }

    if (maxPrice !== undefined && !Number.isFinite(maxPrice)) {
      res.status(400).json({ error: { message: 'maximum price must be a number' } });
      return;
    }

    if (minPrice !== undefined && minPrice < 0) {
      res.status(400).json({ error: { message: 'minimum price cannot be negative' } });
      return;
    }

    if (maxPrice !== undefined && maxPrice < 0) {
      res.status(400).json({ error: { message: 'maximum price cannot be negative' } });
      return;
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      res.status(400).json({ error: { message: 'minimum price cannot be greater than maximum price' } });
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

export const searchGames = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let q;
    if (typeof req.query.q === 'string') {
        q = req.query.q;
    } else {
        q = undefined;
    }

    let studio;
    if (typeof req.query.studio === 'string') {
       studio = req.query.studio;
    } else {
       studio = undefined;
    }

    let sort;
    if (typeof req.query.sort === 'string') {
       sort = req.query.sort;
    } else {
        sort = undefined;
    }

    let startDate;
    if (typeof req.query.startDate === 'string') {
        startDate = req.query.startDate;
    } else {
        startDate = undefined;
    }

    let endDate;
    if (typeof req.query.endDate === 'string') {
       endDate = req.query.endDate;
    } else {
        endDate = undefined;
    }

    let minPrice;
    if (req.query.minPrice) {
       minPrice = Number(req.query.minPrice);
    } else {
       minPrice = undefined;
    }

    let maxPrice;
    if (req.query.maxPrice) {
       maxPrice = Number(req.query.maxPrice);
    } else {
       maxPrice = undefined;
    }

    let minRating;
    if (req.query.minRating) {
        minRating = Number(req.query.minRating);
    } else {
        minRating = undefined;
    }

    const excludeOwned = req.query.excludeOwned === 'true';
    const wishlistOnly = req.query.wishlistOnly === 'true';
    
    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) {
      res.status(400).json({ error: { message: 'Invalid minimum price value' } });
      return;
    }
    if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
      res.status(400).json({ error: { message: 'Invalid maximum price value' } });
      return;
    }

    const games = await gamesService.getAdvancedSearchGames({
      q,
      studio,
      minPrice,
      maxPrice,
      minRating,
      startDate,
      endDate,
      excludeOwned,
      wishlistOnly,
      sort,
      userId,
    });

    res.json(games);
  } catch (err) {
    next(err);
  }
};