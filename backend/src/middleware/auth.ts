import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/index.js';
import { JwtPayload } from '../types/index.js';
import pool from '../db/pool.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: { message: 'Authentication required' } });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const user = await pool.query<{ username: string; role: string }>(
      'SELECT username, role FROM Users WHERE user_id = $1',
      [decoded.user_id],
    );

    if (user.rows.length === 0) {
      res.status(401).json({ error: { message: 'Invalid or expired token' } });
      return;
    }

    req.user = {
      user_id: decoded.user_id,
      username: user.rows[0].username,
      role: user.rows[0].role,
    };
    next();
  } catch {
    res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
};

export default authMiddleware;
