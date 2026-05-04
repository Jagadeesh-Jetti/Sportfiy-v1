import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

const PRISMA_STATUS: Record<string, number> = {
  P2002: 409, // unique constraint
  P2003: 409, // foreign key constraint
  P2025: 404, // record not found
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      issues: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
        code: i.code,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const status = PRISMA_STATUS[err.code] ?? 400;
    const message =
      err.code === 'P2002'
        ? 'Resource already exists'
        : err.code === 'P2025'
          ? 'Resource not found'
          : 'Database constraint violation';
    res.status(status).json({ error: message, code: err.code });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.code ? { code: err.code } : {}),
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Unknown error
  // eslint-disable-next-line no-console
  console.error('Unhandled error on', req.method, req.originalUrl, err);
  res.status(500).json({
    error: 'Internal server error',
    ...(env.NODE_ENV === 'development' && err instanceof Error
      ? { detail: err.message }
      : {}),
  });
};
