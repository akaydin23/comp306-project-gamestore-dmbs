import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cartService.js';

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const items = await cartService.getCart(req.user!.user_id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

export const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { game_id } = req.body;

    if (!game_id || typeof game_id !== 'number' || !Number.isInteger(game_id) || game_id <= 0) {
      res.status(400).json({ error: { message: 'game_id must be a positive integer' } });
      return;
    }

    await cartService.addToCart(req.user!.user_id, game_id);
    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const gameId = Number(req.params.gameId);

    if (!Number.isInteger(gameId) || gameId <= 0) {
      res.status(400).json({ error: { message: 'gameId must be a positive integer' } });
      return;
    }

    await cartService.removeFromCart(req.user!.user_id, gameId);
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await cartService.clearCart(req.user!.user_id);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};
