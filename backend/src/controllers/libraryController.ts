import { Request, Response, NextFunction } from 'express';
import * as libraryService from '../services/libraryService.js';

export const getLibrary = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const library = await libraryService.getUserLibrary(req.user!.user_id);
    res.json({ library });
  } catch (err) {
    next(err);
  }
};
