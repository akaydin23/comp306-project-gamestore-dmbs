import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService.js';

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, bio, profile_image_url } = req.body;

    const user = await userService.updateProfile(
      req.user!.user_id,
      username,
      bio,
      profile_image_url
    );

    res.json({ user });

  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = req.query.q;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: { message: 'Search query parameter "q" is required' } });
      return;
    }

    const users = await userService.searchUsersByUsername(req.user!.user_id, query);
    res.json({ users });
  } catch (err) {
    next(err);
  }
};