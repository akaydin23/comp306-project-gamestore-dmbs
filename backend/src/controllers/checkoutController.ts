import { Request, Response, NextFunction } from 'express';
import * as checkoutService from '../services/checkoutService.js';

export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const purchase = await checkoutService.checkoutCart(req.user!.user_id);
    res.status(201).json({ purchase });
  } catch (err) {
    next(err);
  }
};
