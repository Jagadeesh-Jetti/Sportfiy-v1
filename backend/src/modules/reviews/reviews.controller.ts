import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError.js';
import {
  canReviewVenueService,
  createOrUpdateReviewService,
  deleteMyReviewService,
  listVenueReviewsService,
  replyToReviewService,
} from './reviews.service.js';
import type { CreateReviewInput, ReplyReviewInput } from './reviews.validator.js';

export const listVenueReviewsController = async (req: Request, res: Response) => {
  const result = await listVenueReviewsService(req.params.venueId as string);
  res.json(result);
};

export const upsertReviewController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const review = await createOrUpdateReviewService(
    req.user.id,
    req.params.venueId as string,
    req.body as CreateReviewInput,
  );
  res.status(201).json({ review });
};

export const deleteReviewController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  await deleteMyReviewService(req.user.id, req.params.id as string);
  res.json({ ok: true });
};

export const replyReviewController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const review = await replyToReviewService(
    req.user.id,
    req.params.id as string,
    req.body as ReplyReviewInput,
  );
  res.json({ review });
};

export const canReviewController = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'Authentication required');
  const result = await canReviewVenueService(req.user.id, req.params.venueId as string);
  res.json(result);
};
