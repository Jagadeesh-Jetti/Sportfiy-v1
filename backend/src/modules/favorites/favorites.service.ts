import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';

const FAVORITE_VENUE_SELECT = {
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
  avgRating: true,
  reviewCount: true,
  sports: { select: { id: true, name: true } },
  createdAt: true,
} as const;

export const toggleFavoriteService = async (userId: string, venueId: string) => {
  const venue = await prisma.venue.findUnique({ where: { id: venueId }, select: { id: true } });
  if (!venue) throw new AppError(404, 'Venue not found');

  try {
    await prisma.favorite.create({ data: { userId, venueId } });
    return { favorited: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      await prisma.favorite.delete({ where: { userId_venueId: { userId, venueId } } });
      return { favorited: false };
    }
    throw err;
  }
};

export const listMyFavoritesService = async (userId: string) => {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { venue: { select: FAVORITE_VENUE_SELECT } },
  });
  return rows.map((r) => r.venue);
};

export const getMyFavoriteIdsService = async (userId: string) => {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { venueId: true },
  });
  return rows.map((r) => r.venueId);
};
