import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { loginController, meController, signupController } from './auth.controller.js';
import { loginSchema, signupSchema } from './auth.validator.js';

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const authRouter = Router();

authRouter.post(
  '/signup',
  authLimiter,
  validate({ body: signupSchema }),
  asyncHandler(signupController),
);
authRouter.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(loginController),
);
authRouter.get('/me', requireAuth, asyncHandler(meController));
