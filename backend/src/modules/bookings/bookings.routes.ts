import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/roles.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const bookingLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
import {
  cancelBookingController,
  createBookingController,
  getBookingController,
  listMyBookingsController,
  listVenueBookingsController,
} from './bookings.controller.js';
import {
  bookingIdParamSchema,
  createBookingSchema,
  venueIdParamSchema,
} from './bookings.validator.js';

export const bookingsRouter = Router();

bookingsRouter.post(
  '/',
  requireAuth,
  bookingLimiter,
  validate({ body: createBookingSchema }),
  asyncHandler(createBookingController),
);

bookingsRouter.get('/me', requireAuth, asyncHandler(listMyBookingsController));

bookingsRouter.get(
  '/:id',
  requireAuth,
  validate({ params: bookingIdParamSchema }),
  asyncHandler(getBookingController),
);

bookingsRouter.get(
  '/venue/:venueId',
  requireAuth,
  requireRole(['MERCHANT', 'ADMIN']),
  validate({ params: venueIdParamSchema }),
  asyncHandler(listVenueBookingsController),
);

bookingsRouter.patch(
  '/:id/cancel',
  requireAuth,
  validate({ params: bookingIdParamSchema }),
  asyncHandler(cancelBookingController),
);
