import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/roles.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  canReviewController,
  deleteReviewController,
  listVenueReviewsController,
  replyReviewController,
  upsertReviewController,
} from './reviews.controller.js';
import {
  createReviewSchema,
  replyReviewSchema,
  reviewIdParamSchema,
  venueIdParamSchema,
} from './reviews.validator.js';

export const reviewsRouter = Router();

reviewsRouter.get(
  '/venue/:venueId',
  validate({ params: venueIdParamSchema }),
  asyncHandler(listVenueReviewsController),
);

reviewsRouter.get(
  '/venue/:venueId/can-review',
  requireAuth,
  validate({ params: venueIdParamSchema }),
  asyncHandler(canReviewController),
);

reviewsRouter.post(
  '/venue/:venueId',
  requireAuth,
  validate({ params: venueIdParamSchema, body: createReviewSchema }),
  asyncHandler(upsertReviewController),
);

reviewsRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: reviewIdParamSchema }),
  asyncHandler(deleteReviewController),
);

reviewsRouter.post(
  '/:id/reply',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  validate({ params: reviewIdParamSchema, body: replyReviewSchema }),
  asyncHandler(replyReviewController),
);
