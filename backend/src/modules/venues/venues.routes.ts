import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/roles.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createVenueController,
  deleteVenueController,
  getSimilarVenuesController,
  getVenueController,
  listMyVenuesController,
  listVenuesController,
  merchantAnalyticsController,
  updateVenueController,
} from './venues.controller.js';
import {
  createVenueSchema,
  listVenuesQuerySchema,
  updateVenueSchema,
  venueIdParamSchema,
} from './venues.validator.js';
import {
  availabilityController,
  defineSlotsBulkController,
  defineSlotsController,
} from './slots.controller.js';
import {
  availabilityQuerySchema,
  defineSlotsBulkSchema,
  defineSlotsSchema,
} from './slots.validator.js';

export const venuesRouter = Router();

venuesRouter.get('/', validate({ query: listVenuesQuerySchema }), asyncHandler(listVenuesController));

venuesRouter.get(
  '/me/owned',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  asyncHandler(listMyVenuesController),
);

venuesRouter.get(
  '/me/analytics',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  asyncHandler(merchantAnalyticsController),
);

venuesRouter.get(
  '/:id/similar',
  validate({ params: venueIdParamSchema }),
  asyncHandler(getSimilarVenuesController),
);

venuesRouter.get(
  '/:id',
  validate({ params: venueIdParamSchema }),
  asyncHandler(getVenueController),
);

venuesRouter.post(
  '/',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  validate({ body: createVenueSchema }),
  asyncHandler(createVenueController),
);

venuesRouter.patch(
  '/:id',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  validate({ params: venueIdParamSchema, body: updateVenueSchema }),
  asyncHandler(updateVenueController),
);

venuesRouter.delete(
  '/:id',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  validate({ params: venueIdParamSchema }),
  asyncHandler(deleteVenueController),
);

venuesRouter.get(
  '/:id/availability',
  validate({ params: venueIdParamSchema, query: availabilityQuerySchema }),
  asyncHandler(availabilityController),
);

venuesRouter.post(
  '/:id/slots',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  validate({ params: venueIdParamSchema, body: defineSlotsSchema }),
  asyncHandler(defineSlotsController),
);

venuesRouter.post(
  '/:id/slots/bulk',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  validate({ params: venueIdParamSchema, body: defineSlotsBulkSchema }),
  asyncHandler(defineSlotsBulkController),
);
