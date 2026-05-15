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
  amenities: true,
  avgRating: true,
  reviewCount: true,
  isVerified: true,
  createdAt: true,
  sports: { select: { id: true, name: true } },
} as const;

const VENUE_DETAIL_SELECT = {
  ...VENUE_LIST_SELECT,
  address: true,
  phone: true,
  ownerId: true,
  owner: { select: { id: true, name: true, avatarUrl: true, bio: true, createdAt: true } },
} as const;

const orderByForSort = (sort: ListVenuesQuery['sort']): Prisma.VenueOrderByWithRelationInput[] => {
  switch (sort) {
    case 'rating':
      return [{ avgRating: { sort: 'desc', nulls: 'last' } }, { reviewCount: 'desc' }];
    case 'price_asc':
      return [{ pricePerHour: { sort: 'asc', nulls: 'last' } }];
    case 'price_desc':
      return [{ pricePerHour: { sort: 'desc', nulls: 'last' } }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }];
  }
};

export const listVenuesService = async (query: ListVenuesQuery) => {
  const { sport, city, q, minPrice, maxPrice, minRating, amenity, sort, page, limit } = query;

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
  if (minRating !== undefined) {
    where.avgRating = { gte: minRating };
  }
  if (amenity) {
    where.amenities = { has: amenity };
  }

  const [items, total] = await Promise.all([
    prisma.venue.findMany({
      where,
      select: VENUE_LIST_SELECT,
      orderBy: orderByForSort(sort),
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

export const getSimilarVenuesService = async (id: string, limit = 4) => {
  const base = await prisma.venue.findUnique({
    where: { id },
    select: { city: true, sports: { select: { id: true } } },
  });
  if (!base) return [];
  const sportIds = base.sports.map((s) => s.id);
  return prisma.venue.findMany({
    where: {
      id: { not: id },
      ...(base.city ? { city: base.city } : {}),
      ...(sportIds.length > 0 ? { sports: { some: { id: { in: sportIds } } } } : {}),
    },
    select: VENUE_LIST_SELECT,
    orderBy: [{ avgRating: { sort: 'desc', nulls: 'last' } }, { reviewCount: 'desc' }],
    take: limit,
  });
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

export const getMerchantAnalyticsService = async (ownerId: string) => {
  const venues = await prisma.venue.findMany({
    where: { ownerId },
    select: { id: true },
  });
  const venueIds = venues.map((v) => v.id);
  if (venueIds.length === 0) {
    return { venues: 0, bookingsTotal: 0, bookingsThisWeek: 0, revenueThisWeek: 0, avgRating: null, topSports: [] };
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [bookingsTotal, weekBookings, ratingAgg, topSports] = await Promise.all([
    prisma.booking.count({ where: { venueId: { in: venueIds }, status: { not: 'CANCELLED' } } }),
    prisma.booking.findMany({
      where: {
        venueId: { in: venueIds },
        status: { not: 'CANCELLED' },
        createdAt: { gte: weekAgo },
      },
      include: { venue: { select: { pricePerHour: true } } },
    }),
    prisma.review.aggregate({
      where: { venueId: { in: venueIds } },
      _avg: { rating: true },
    }),
    prisma.booking.groupBy({
      by: ['sportId'],
      where: { venueId: { in: venueIds }, status: { not: 'CANCELLED' } },
      _count: { _all: true },
      orderBy: { _count: { sportId: 'desc' } },
      take: 5,
    }),
  ]);

  const sportRows = await prisma.sport.findMany({
    where: { id: { in: topSports.map((t) => t.sportId) } },
    select: { id: true, name: true },
  });
  const sportName = Object.fromEntries(sportRows.map((s) => [s.id, s.name]));

  return {
    venues: venueIds.length,
    bookingsTotal,
    bookingsThisWeek: weekBookings.length,
    revenueThisWeek: weekBookings.reduce(
      (sum, b) => sum + (b.venue.pricePerHour ?? 0),
      0,
    ),
    avgRating: ratingAgg._avg.rating,
    topSports: topSports.map((t) => ({
      sportId: t.sportId,
      sportName: sportName[t.sportId] ?? 'Unknown',
      bookings: t._count._all,
    })),
  };
};
