import { Request, Response, NextFunction } from 'express';
import * as friendsService from '../services/friendsService.js';

export const getFriends = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const friends = await friendsService.getFriends(req.user!.user_id);
    res.json({ friends });
  } catch (err) {
    next(err);
  }
};

export const getPendingRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const requests = await friendsService.getPendingRequests(req.user!.user_id);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
};

export const sendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { receiver_id } = req.body;

    if (!receiver_id || typeof receiver_id !== 'number' || !Number.isInteger(receiver_id) || receiver_id <= 0) {
      res.status(400).json({ error: { message: 'receiver_id must be a positive integer' } });
      return;
    }

    if (receiver_id === req.user!.user_id) {
      res.status(400).json({ error: { message: 'You cannot send a friend request to yourself' } });
      return;
    }

    await friendsService.sendFriendRequest(req.user!.user_id, receiver_id);
    res.status(201).json({ message: 'Friend request sent' });
  } catch (err) {
    next(err);
  }
};

export const acceptRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const senderId = Number(req.params.senderId);

    if (!Number.isInteger(senderId) || senderId <= 0) {
      res.status(400).json({ error: { message: 'senderId must be a positive integer' } });
      return;
    }

    await friendsService.acceptFriendRequest(req.user!.user_id, senderId);
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    next(err);
  }
};