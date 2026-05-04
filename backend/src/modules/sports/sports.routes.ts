import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { listSportsController } from './sports.controller.js';

export const sportsRouter = Router();

sportsRouter.get('/', asyncHandler(listSportsController));
