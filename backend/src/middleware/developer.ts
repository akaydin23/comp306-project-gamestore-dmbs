import { Request, Response, NextFunction } from 'express';

const developerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'DEVELOPER') {
    res.status(403).json({ error: { message: 'Developer access required' } });
    return;
  }

  next();
};

export default developerMiddleware;
