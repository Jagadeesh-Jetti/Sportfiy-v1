import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import type { AuthTokenPayload } from '../utils/jwt.js';

type Role = AuthTokenPayload['role'];

export const requireRole =
  (roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }
    next();
  };
