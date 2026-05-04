import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { meController, updateMeController } from './users.controller.js';
import { updateMeSchema } from './users.validator.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(meController));
usersRouter.patch(
  '/me',
  requireAuth,
  validate({ body: updateMeSchema }),
  asyncHandler(updateMeController),
);
