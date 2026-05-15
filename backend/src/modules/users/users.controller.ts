import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import {
  changePasswordService,
  deleteMyAccountService,
  exportMyDataService,
  getMeService,
  updateMeService,
} from './users.service.js';
import type {
  ChangePasswordInput,
  DeleteAccountInput,
  UpdateMeInput,
} from './users.validator.js';

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

export const changePasswordController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await changePasswordService(req.user.id, req.body as ChangePasswordInput);
  res.json(result);
};

export const exportMyDataController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const data = await exportMyDataService(req.user.id);
  res.setHeader('Content-Disposition', 'attachment; filename="sportify-my-data.json"');
  res.json(data);
};

export const deleteMyAccountController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await deleteMyAccountService(req.user.id, req.body as DeleteAccountInput);
  res.json(result);
};
