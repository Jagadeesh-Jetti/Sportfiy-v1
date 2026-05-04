import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { sportsRouter } from './modules/sports/sports.routes.js';
import { venuesRouter } from './modules/venues/venues.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/sports', sportsRouter);
router.use('/venues', venuesRouter);
router.use('/bookings', bookingsRouter);
