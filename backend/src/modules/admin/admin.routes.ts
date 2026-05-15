import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/roles.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { AppError } from '../../utils/AppError.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(['ADMIN']));

// Cross-platform stats
adminRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const [
      totalUsers,
      totalMerchants,
      totalVenues,
      verifiedVenues,
      totalBookings,
      cancelledBookings,
      totalReviews,
      avgRatingRow,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MERCHANT' } }),
      prisma.venue.count(),
      prisma.venue.count({ where: { isVerified: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);
    res.json({
      users: { total: totalUsers, merchants: totalMerchants },
      venues: { total: totalVenues, verified: verifiedVenues },
      bookings: {
        total: totalBookings,
        cancelled: cancelledBookings,
        cancelRate: totalBookings === 0 ? 0 : cancelledBookings / totalBookings,
      },
      reviews: { total: totalReviews, avg: avgRatingRow._avg.rating },
    });
  }),
);

// Users — list with search
adminRouter.get(
  '/users',
  validate({
    query: z.object({
      q: z.string().trim().optional(),
      role: z.enum(['PLAYER', 'MERCHANT', 'ADMIN']).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { q, role } = req.query as { q?: string; role?: 'PLAYER' | 'MERCHANT' | 'ADMIN' };
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, loyaltyPoints: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ users });
  }),
);

// Venues — list (incl. unverified)
adminRouter.get(
  '/venues',
  asyncHandler(async (_req, res) => {
    const venues = await prisma.venue.findMany({
      select: {
        id: true, name: true, city: true, location: true,
        avgRating: true, reviewCount: true, isVerified: true,
        owner: { select: { id: true, name: true, email: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ venues });
  }),
);

// Toggle venue verification
adminRouter.post(
  '/venues/:id/verify',
  validate({ params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    const venue = await prisma.venue.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, isVerified: true },
    });
    if (!venue) throw new AppError(404, 'Venue not found');
    const updated = await prisma.venue.update({
      where: { id: venue.id },
      data: { isVerified: !venue.isVerified },
      select: { id: true, isVerified: true },
    });
    res.json({ venue: updated });
  }),
);

// Bookings — recent
adminRouter.get(
  '/bookings',
  asyncHandler(async (_req, res) => {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        venue: { select: { id: true, name: true, city: true } },
        sport: true,
        slot: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ bookings });
  }),
);

// Reviews — recent (for moderation visibility)
adminRouter.get(
  '/reviews',
  asyncHandler(async (_req, res) => {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true } },
        venue: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ reviews });
  }),
);

// Hard-delete a review (admin moderation)
adminRouter.delete(
  '/reviews/:id',
  validate({ params: z.object({ id: z.string().uuid() }) }),
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const review = await prisma.review.findUnique({ where: { id }, select: { venueId: true } });
    if (!review) throw new AppError(404, 'Review not found');
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });
      const agg = await tx.review.aggregate({
        where: { venueId: review.venueId },
        _avg: { rating: true },
        _count: { _all: true },
      });
      await tx.venue.update({
        where: { id: review.venueId },
        data: {
          avgRating: agg._count._all > 0 ? agg._avg.rating : null,
          reviewCount: agg._count._all,
        },
      });
    });
    res.json({ ok: true });
  }),
);
