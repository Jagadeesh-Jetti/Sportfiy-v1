import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import {
  defineSlotsBulkService,
  defineSlotsService,
  getAvailabilityService,
} from './slots.service.js';
import type {
  AvailabilityQuery,
  DefineSlotsBulkInput,
  DefineSlotsInput,
} from './slots.validator.js';

export const defineSlotsController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await defineSlotsService(
    req.params.id as string,
    req.user.id,
    req.body as DefineSlotsInput,
  );
  res.status(201).json(result);
};

export const defineSlotsBulkController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await defineSlotsBulkService(
    req.params.id as string,
    req.user.id,
    req.body as DefineSlotsBulkInput,
  );
  res.status(201).json(result);
};

export const availabilityController = async (req: Request, res: Response) => {
  const result = await getAvailabilityService(
    req.params.id as string,
    req.query as unknown as AvailabilityQuery,
  );
  res.json(result);
};
