import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  activityIdParamSchema,
  createActivitySchema,
  listActivitiesQuerySchema,
} from './activities.validator.js';
import {
  cancelActivityController,
  createActivityController,
  getActivityController,
  joinActivityController,
  leaveActivityController,
  listActivitiesController,
  listMyActivitiesController,
} from './activities.controller.js';

export const activitiesRouter = Router();

activitiesRouter.get(
  '/',
  validate({ query: listActivitiesQuerySchema }),
  asyncHandler(listActivitiesController),
);

activitiesRouter.get('/me', requireAuth, asyncHandler(listMyActivitiesController));

activitiesRouter.get(
  '/:id',
  validate({ params: activityIdParamSchema }),
  asyncHandler(getActivityController),
);

activitiesRouter.post(
  '/',
  requireAuth,
  validate({ body: createActivitySchema }),
  asyncHandler(createActivityController),
);

activitiesRouter.post(
  '/:id/join',
  requireAuth,
  validate({ params: activityIdParamSchema }),
  asyncHandler(joinActivityController),
);

activitiesRouter.post(
  '/:id/leave',
  requireAuth,
  validate({ params: activityIdParamSchema }),
  asyncHandler(leaveActivityController),
);

activitiesRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: activityIdParamSchema }),
  asyncHandler(cancelActivityController),
);
