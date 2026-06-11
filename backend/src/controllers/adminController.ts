import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService.js';
import { AdminGameInput } from '../services/adminService.js';

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseOptionalPositiveInt(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  return parsePositiveInt(value);
}

function parseGameInput(body: Record<string, unknown>): AdminGameInput | null {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' && body.description.trim() !== ''
    ? body.description.trim()
    : null;
  const price = Number(body.price);
  const developer_user_id = parseOptionalPositiveInt(body.developer_user_id);
  const release_date = typeof body.release_date === 'string' && body.release_date.trim() !== ''
    ? body.release_date.trim()
    : null;
  const cover_image_url = typeof body.cover_image_url === 'string' && body.cover_image_url.trim() !== ''
    ? body.cover_image_url.trim()
    : null;
  const genre_ids = Array.isArray(body.genre_ids)
    ? body.genre_ids
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    : [];

  if (!name || !Number.isFinite(price) || price < 0) return null;

  return {
    name,
    description,
    price,
    developer_user_id,
    release_date,
    cover_image_url,
    genre_ids: [...new Set(genre_ids)],
  };
}

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await adminService.getStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await adminService.getUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

export const getPurchases = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const purchases = await adminService.getPurchases();
    res.json({ purchases });
  } catch (err) {
    next(err);
  }
};

export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = parseGameInput(req.body);

    if (!input) {
      res.status(400).json({ error: { message: 'name and non-negative price are required' } });
      return;
    }

    const game = await adminService.createGame(input);
    res.status(201).json({ game });
  } catch (err) {
    next(err);
  }
};

export const updateGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gameId = parsePositiveInt(req.params.gameId);
    const input = parseGameInput(req.body);

    if (!gameId) {
      res.status(400).json({ error: { message: 'gameId must be a positive integer' } });
      return;
    }

    if (!input) {
      res.status(400).json({ error: { message: 'name and non-negative price are required' } });
      return;
    }

    const game = await adminService.updateGame(gameId, input);
    res.json({ game });
  } catch (err) {
    next(err);
  }
};

export const deleteGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gameId = parsePositiveInt(req.params.gameId);

    if (!gameId) {
      res.status(400).json({ error: { message: 'gameId must be a positive integer' } });
      return;
    }

    await adminService.deleteGame(gameId);
    res.json({ message: 'Game deleted' });
  } catch (err) {
    next(err);
  }
};

export const createGenre = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      res.status(400).json({ error: { message: 'name is required' } });
      return;
    }

    const genre = await adminService.createGenre(name);
    res.status(201).json({ genre });
  } catch (err) {
    next(err);
  }
};

export const updateGenre = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const genreId = parsePositiveInt(req.params.genreId);
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';

    if (!genreId) {
      res.status(400).json({ error: { message: 'genreId must be a positive integer' } });
      return;
    }

    if (!name) {
      res.status(400).json({ error: { message: 'name is required' } });
      return;
    }

    const genre = await adminService.updateGenre(genreId, name);
    res.json({ genre });
  } catch (err) {
    next(err);
  }
};

export const deleteGenre = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const genreId = parsePositiveInt(req.params.genreId);

    if (!genreId) {
      res.status(400).json({ error: { message: 'genreId must be a positive integer' } });
      return;
    }

    await adminService.deleteGenre(genreId);
    res.json({ message: 'Genre deleted' });
  } catch (err) {
    next(err);
  }
};
