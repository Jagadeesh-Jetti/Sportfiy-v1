import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

export type AuthTokenPayload = {
  id: string;
  role: 'PLAYER' | 'MERCHANT' | 'ADMIN';
};

export const generateToken = (
  payload: AuthTokenPayload,
  expiresIn: SignOptions['expiresIn'] = env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
      throw new AppError(401, 'Invalid token payload');
    }
    const { id, role } = decoded as Record<string, unknown>;
    if (typeof id !== 'string' || typeof role !== 'string') {
      throw new AppError(401, 'Invalid token payload');
    }
    return { id, role: role as AuthTokenPayload['role'] };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, 'Invalid or expired token');
  }
};
