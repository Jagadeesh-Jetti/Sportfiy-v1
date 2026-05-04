import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import { getMeService, updateMeService } from './users.service.js';
import type { UpdateMeInput } from './users.validator.js';

export const meController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const user = await getMeService(req.user.id);
  res.json({ user });
};

export const updateMeController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const user = await updateMeService(req.user.id, req.body as UpdateMeInput);
  res.json({ user });
};
