import { Request, Response, NextFunction } from 'express';
import * as genresService from '../services/genresService.js';

export const getGenres = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const genres = await genresService.getGenres();
    res.json({ genres });
  } catch (err) {
    next(err);
  }
};
