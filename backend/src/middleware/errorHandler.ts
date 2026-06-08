import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(err.stack);
  const status: number = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
};

export default errorHandler;
