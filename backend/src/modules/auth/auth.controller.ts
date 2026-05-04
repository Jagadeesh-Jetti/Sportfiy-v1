import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import { getMeService, loginService, signupService } from './auth.service.js';
import type { LoginInput, SignupInput } from './auth.validator.js';

export const signupController = async (req: Request, res: Response) => {
  const result = await signupService(req.body as SignupInput);
  res.status(201).json(result);
};

export const loginController = async (req: Request, res: Response) => {
  const result = await loginService(req.body as LoginInput);
  res.json(result);
};

export const meController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const user = await getMeService(req.user.id);
  res.json({ user });
};
