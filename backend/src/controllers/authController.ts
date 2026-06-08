import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: { message: 'username, email, and password are required' } });
      return;
    }

    const user = await authService.registerUser(username, email, password);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: { message: 'email and password are required' } });
      return;
    }

    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getUserById(req.user!.user_id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
