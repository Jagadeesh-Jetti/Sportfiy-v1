import { Router } from 'express';
import { prisma } from '../../config/db.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const statsRouter = Router();

// Public — used by the landing page to replace hardcoded counts.
statsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [users, venues, sports, bookings, cities] = await Promise.all([
      prisma.user.count(),
      prisma.venue.count(),
      prisma.sport.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.venue.findMany({
        where: { city: { not: null } },
        select: { city: true },
        distinct: ['city'],
      }),
    ]);
    res.json({
      users,
      venues,
      sports,
      bookings,
      cities: cities.map((c) => c.city).filter((c): c is string => Boolean(c)),
    });
  }),
);
