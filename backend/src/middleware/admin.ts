import { Request, Response, NextFunction } from 'express';

const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: { message: 'Admin access required' } });
    return;
  }

  next();
};

export default adminMiddleware;
