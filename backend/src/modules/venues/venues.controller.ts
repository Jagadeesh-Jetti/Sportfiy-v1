import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import {
  createVenueService,
  deleteVenueService,
  getMerchantAnalyticsService,
  getSimilarVenuesService,
  getVenueByIdService,
  listMyVenuesService,
  listVenuesService,
  updateVenueService,
} from './venues.service.js';
import type {
  CreateVenueInput,
  ListVenuesQuery,
  UpdateVenueInput,
} from './venues.validator.js';

export const listVenuesController = async (req: Request, res: Response) => {
  const result = await listVenuesService(req.query as unknown as ListVenuesQuery);
  res.json(result);
};

export const getVenueController = async (req: Request, res: Response) => {
  const venue = await getVenueByIdService(req.params.id as string);
  res.json({ venue });
};

export const getSimilarVenuesController = async (req: Request, res: Response) => {
  const venues = await getSimilarVenuesService(req.params.id as string);
  res.json({ venues });
};

export const createVenueController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const venue = await createVenueService(req.user.id, req.body as CreateVenueInput);
  res.status(201).json({ venue });
};

export const updateVenueController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const venue = await updateVenueService(
    req.params.id as string,
    req.user.id,
    req.body as UpdateVenueInput,
  );
  res.json({ venue });
};

export const deleteVenueController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await deleteVenueService(req.params.id as string, req.user.id);
  res.json(result);
};

export const listMyVenuesController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const venues = await listMyVenuesService(req.user.id);
  res.json({ venues });
};

export const merchantAnalyticsController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const analytics = await getMerchantAnalyticsService(req.user.id);
  res.json(analytics);
};
