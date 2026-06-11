import { Request, Response, NextFunction } from 'express';
import * as developerService from '../services/developerService.js';
import { AdminGameInput } from '../services/adminService.js';

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseGameInput(body: Record<string, unknown>): AdminGameInput | null {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' && body.description.trim() !== ''
    ? body.description.trim()
    : null;
  const price = Number(body.price);
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
    developer_user_id: null,
    release_date,
    cover_image_url,
    genre_ids: [...new Set(genre_ids)],
  };
}

export const getDeveloperGames = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const games = await developerService.getDeveloperGames(req.user!.user_id);
    res.json({ games });
  } catch (err) {
    next(err);
  }
};

export const createDeveloperGame = async (
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

    const game = await developerService.createDeveloperGame(req.user!.user_id, input);
    res.status(201).json({ game });
  } catch (err) {
    next(err);
  }
};

export const updateDeveloperGame = async (
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

    const game = await developerService.updateDeveloperGame(req.user!.user_id, gameId, input);
    res.json({ game });
  } catch (err) {
    next(err);
  }
};

export const deleteDeveloperGame = async (
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

    await developerService.deleteDeveloperGame(req.user!.user_id, gameId);
    res.json({ message: 'Game deleted' });
  } catch (err) {
    next(err);
  }
};
