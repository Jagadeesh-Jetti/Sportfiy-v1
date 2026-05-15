import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import type { CreateReviewInput, ReplyReviewInput } from './reviews.validator.js';

const REVIEW_INCLUDE = {
  user: { select: { id: true, name: true, avatarUrl: true } },
} as const;

const recomputeVenueRating = async (tx: Prisma.TransactionClient, venueId: string) => {
  const agg = await tx.review.aggregate({
    where: { venueId },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await tx.venue.update({
    where: { id: venueId },
    data: {
      avgRating: agg._count._all > 0 ? agg._avg.rating : null,
      reviewCount: agg._count._all,
    },
  });
};

export const listVenueReviewsService = async (venueId: string) => {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true, avgRating: true, reviewCount: true },
  });
  if (!venue) throw new AppError(404, 'Venue not found');

  const reviews = await prisma.review.findMany({
    where: { venueId },
    include: REVIEW_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

  return {
    avgRating: venue.avgRating,
    reviewCount: venue.reviewCount,
    reviews,
  };
};

export const createOrUpdateReviewService = async (
  userId: string,
  venueId: string,
  input: CreateReviewInput,
) => {
  const venue = await prisma.venue.findUnique({ where: { id: venueId }, select: { id: true } });
  if (!venue) throw new AppError(404, 'Venue not found');

  // Eligibility: user must have a non-cancelled, past booking at this venue.
  const eligibleBooking = await prisma.booking.findFirst({
    where: {
      userId,
      venueId,
      status: { not: 'CANCELLED' },
      slot: { endTime: { lt: new Date() } },
    },
    select: { id: true },
  });
  if (!eligibleBooking) {
    throw new AppError(
      403,
      'You can only review a venue after you have actually played there.',
    );
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.upsert({
      where: { userId_venueId: { userId, venueId } },
      create: { userId, venueId, rating: input.rating, comment: input.comment ?? null },
      update: { rating: input.rating, comment: input.comment ?? null },
      include: REVIEW_INCLUDE,
    });
    await recomputeVenueRating(tx, venueId);
    return review;
  });
};

export const deleteMyReviewService = async (userId: string, reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, 'Review not found');
  if (review.userId !== userId) throw new AppError(403, 'Not allowed');

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });
    await recomputeVenueRating(tx, review.venueId);
  });
};

export const replyToReviewService = async (
  ownerId: string,
  reviewId: string,
  input: ReplyReviewInput,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { venue: { select: { ownerId: true } } },
  });
  if (!review) throw new AppError(404, 'Review not found');
  if (review.venue.ownerId !== ownerId) {
    throw new AppError(403, 'Only the venue owner can reply to this review');
  }
  return prisma.review.update({
    where: { id: reviewId },
    data: { reply: input.reply, replyAt: new Date() },
    include: REVIEW_INCLUDE,
  });
};

export const canReviewVenueService = async (userId: string, venueId: string) => {
  const eligibleBooking = await prisma.booking.findFirst({
    where: {
      userId,
      venueId,
      status: { not: 'CANCELLED' },
      slot: { endTime: { lt: new Date() } },
    },
    select: { id: true },
  });
  const existing = await prisma.review.findUnique({
    where: { userId_venueId: { userId, venueId } },
  });
  return { canReview: Boolean(eligibleBooking), existingReview: existing };
};
