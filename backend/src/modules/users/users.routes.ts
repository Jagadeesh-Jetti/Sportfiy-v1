import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  changePasswordController,
  deleteMyAccountController,
  exportMyDataController,
  meController,
  updateMeController,
} from './users.controller.js';
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateMeSchema,
} from './users.validator.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(meController));
usersRouter.patch(
  '/me',
  requireAuth,
  validate({ body: updateMeSchema }),
  asyncHandler(updateMeController),
);
usersRouter.post(
  '/me/change-password',
  requireAuth,
  validate({ body: changePasswordSchema }),
  asyncHandler(changePasswordController),
);
usersRouter.get('/me/export', requireAuth, asyncHandler(exportMyDataController));
usersRouter.delete(
  '/me',
  requireAuth,
  validate({ body: deleteAccountSchema }),
  asyncHandler(deleteMyAccountController),
);
