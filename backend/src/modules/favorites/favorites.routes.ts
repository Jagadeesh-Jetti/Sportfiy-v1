import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  listMyFavoritesController,
  myFavoriteIdsController,
  toggleFavoriteController,
} from './favorites.controller.js';

export const favoritesRouter = Router();

const venueIdParam = z.object({ venueId: z.string().uuid() });

favoritesRouter.get('/me', requireAuth, asyncHandler(listMyFavoritesController));
favoritesRouter.get('/me/ids', requireAuth, asyncHandler(myFavoriteIdsController));
favoritesRouter.post(
  '/:venueId/toggle',
  requireAuth,
  validate({ params: venueIdParam }),
  asyncHandler(toggleFavoriteController),
);
