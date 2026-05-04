import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateVenueInput,
  ListVenuesQuery,
  UpdateVenueInput,
} from './venues.validator.js';

const VENUE_LIST_SELECT = {
  id: true,
  name: true,
  description: true,
  location: true,
  city: true,
  images: true,
  lat: true,
  lng: true,
  pricePerHour: true,
  openingHour: true,
  closingHour: true,
  slotDurationMinutes: true,
  createdAt: true,
  sports: { select: { id: true, name: true } },
} as const;

const VENUE_DETAIL_SELECT = {
  ...VENUE_LIST_SELECT,
  address: true,
  ownerId: true,
  owner: { select: { id: true, name: true, avatarUrl: true } },
} as const;

export const listVenuesService = async (query: ListVenuesQuery) => {
  const { sport, city, q, minPrice, maxPrice, page, limit } = query;

  const where: Prisma.VenueWhereInput = {};
  if (city) where.city = { equals: city, mode: 'insensitive' };
  if (sport) where.sports = { some: { name: { equals: sport, mode: 'insensitive' } } };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { location: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerHour = {};
    if (minPrice !== undefined) where.pricePerHour.gte = minPrice;
    if (maxPrice !== undefined) where.pricePerHour.lte = maxPrice;
  }

  const [items, total] = await Promise.all([
    prisma.venue.findMany({
      where,
      select: VENUE_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.venue.count({ where }),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getVenueByIdService = async (id: string) => {
  const venue = await prisma.venue.findUnique({
    where: { id },
    select: VENUE_DETAIL_SELECT,
  });
  if (!venue) throw new AppError(404, 'Venue not found');
  return venue;
};

export const createVenueService = async (ownerId: string, input: CreateVenueInput) => {
  const { sportIds, ...rest } = input;
  return prisma.venue.create({
    data: {
      ...rest,
      ownerId,
      sports: { connect: sportIds.map((id) => ({ id })) },
    },
    select: VENUE_DETAIL_SELECT,
  });
};

export const updateVenueService = async (
  id: string,
  ownerId: string,
  input: UpdateVenueInput,
) => {
  const venue = await prisma.venue.findUnique({ where: { id }, select: { ownerId: true } });
  if (!venue) throw new AppError(404, 'Venue not found');
  if (venue.ownerId !== ownerId) throw new AppError(403, 'You do not own this venue');

  const { sportIds, ...rest } = input;
  return prisma.venue.update({
    where: { id },
    data: {
      ...rest,
      ...(sportIds ? { sports: { set: sportIds.map((sid) => ({ id: sid })) } } : {}),
    },
    select: VENUE_DETAIL_SELECT,
  });
};

export const deleteVenueService = async (id: string, ownerId: string) => {
  const venue = await prisma.venue.findUnique({ where: { id }, select: { ownerId: true } });
  if (!venue) throw new AppError(404, 'Venue not found');
  if (venue.ownerId !== ownerId) throw new AppError(403, 'You do not own this venue');

  const activeBookings = await prisma.booking.count({
    where: { venueId: id, status: { not: 'CANCELLED' } },
  });
  if (activeBookings > 0) {
    throw new AppError(409, 'Cannot delete venue with active bookings');
  }

  await prisma.venue.delete({ where: { id } });
  return { id };
};

export const listMyVenuesService = async (ownerId: string) => {
  return prisma.venue.findMany({
    where: { ownerId },
    select: VENUE_LIST_SELECT,
    orderBy: { createdAt: 'desc' },
  });
};
