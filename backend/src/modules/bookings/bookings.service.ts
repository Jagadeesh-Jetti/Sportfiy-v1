import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import type { CreateBookingInput } from './bookings.validator.js';

const BOOKING_INCLUDE = {
  sport: true,
  slot: true,
  venue: {
    select: { id: true, name: true, location: true, city: true, images: true },
  },
} as const;

export const createBookingService = async (userId: string, input: CreateBookingInput) => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const slot = await tx.slot.findUnique({
          where: { id: input.slotId },
          select: { id: true, venueId: true, startTime: true, endTime: true },
        });
        if (!slot) throw new AppError(404, 'Slot not found');

        const sport = await tx.sport.findUnique({
          where: { id: input.sportId },
          select: { id: true },
        });
        if (!sport) throw new AppError(404, 'Sport not found');

        if (slot.endTime <= new Date()) {
          throw new AppError(400, 'Slot is in the past');
        }

        return tx.booking.create({
          data: {
            userId,
            venueId: slot.venueId,
            sportId: input.sportId,
            slotId: slot.id,
            status: 'CONFIRMED',
          },
          include: BOOKING_INCLUDE,
        });
      },
      { isolationLevel: 'Serializable' },
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Slot already booked');
    }
    throw err;
  }
};

export const listMyBookingsService = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: BOOKING_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  const now = new Date();
  return {
    upcoming: bookings.filter(
      (b) => b.status !== 'CANCELLED' && b.slot && b.slot.endTime > now,
    ),
    past: bookings.filter((b) => !b.slot || b.slot.endTime <= now || b.status === 'CANCELLED'),
  };
};

export const listVenueBookingsService = async (venueId: string, ownerId: string) => {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { ownerId: true },
  });
  if (!venue) throw new AppError(404, 'Venue not found');
  if (venue.ownerId !== ownerId) throw new AppError(403, 'You do not own this venue');

  return prisma.booking.findMany({
    where: { venueId },
    include: { sport: true, slot: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const cancelBookingService = async (
  bookingId: string,
  userId: string,
  userRole: 'PLAYER' | 'MERCHANT' | 'ADMIN',
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { venue: { select: { ownerId: true } } },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const isOwner = booking.userId === userId;
  const isVenueOwner = booking.venue.ownerId === userId;
  const isAdmin = userRole === 'ADMIN';
  if (!isOwner && !isVenueOwner && !isAdmin) {
    throw new AppError(403, 'Not allowed to cancel this booking');
  }

  if (booking.status === 'CANCELLED') {
    return { id: booking.id, status: booking.status };
  }

  return prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
    include: BOOKING_INCLUDE,
  });
};
