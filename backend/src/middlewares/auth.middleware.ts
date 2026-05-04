import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing or malformed Authorization header'));
  }
  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(new AppError(401, 'Missing bearer token'));
  }
  req.user = verifyToken(token);
  next();
};
