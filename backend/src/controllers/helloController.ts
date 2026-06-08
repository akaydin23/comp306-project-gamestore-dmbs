import { Request, Response } from 'express';

export const getHello = (req: Request, res: Response): void => {
  res.json({ message: 'Hello, World!' });
};
