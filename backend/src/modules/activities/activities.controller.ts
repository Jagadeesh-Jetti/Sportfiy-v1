import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import {
  cancelActivityService,
  createActivityService,
  getActivityService,
  joinActivityService,
  leaveActivityService,
  listActivitiesService,
  listMyActivitiesService,
} from './activities.service.js';
import type { CreateActivityInput, ListActivitiesQuery } from './activities.validator.js';

export const listActivitiesController = async (req: Request, res: Response) => {
  const activities = await listActivitiesService(req.query as unknown as ListActivitiesQuery);
  res.json({ activities });
};

export const getActivityController = async (req: Request, res: Response) => {
  const activity = await getActivityService(req.params.id as string);
  res.json({ activity });
};

export const createActivityController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const activity = await createActivityService(req.user.id, req.body as CreateActivityInput);
  res.status(201).json({ activity });
};

export const joinActivityController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const activity = await joinActivityService(req.user.id, req.params.id as string);
  res.json({ activity });
};

export const leaveActivityController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const activity = await leaveActivityService(req.user.id, req.params.id as string);
  res.json({ activity });
};

export const cancelActivityController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await cancelActivityService(req.user.id, req.params.id as string);
  res.json(result);
};

export const listMyActivitiesController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const activities = await listMyActivitiesService(req.user.id);
  res.json({ activities });
};
