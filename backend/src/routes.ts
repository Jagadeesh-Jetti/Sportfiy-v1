import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { sportsRouter } from './modules/sports/sports.routes.js';
import { venuesRouter } from './modules/venues/venues.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { reviewsRouter } from './modules/reviews/reviews.routes.js';
import { activitiesRouter } from './modules/activities/activities.routes.js';
import { favoritesRouter } from './modules/favorites/favorites.routes.js';
import { statsRouter } from './modules/stats/stats.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/sports', sportsRouter);
router.use('/venues', venuesRouter);
router.use('/bookings', bookingsRouter);
router.use('/reviews', reviewsRouter);
router.use('/activities', activitiesRouter);
router.use('/favorites', favoritesRouter);
router.use('/stats', statsRouter);
router.use('/admin', adminRouter);
