import bcrypt from 'bcrypt';
import { prisma } from '../src/config/db.js';
import { generateToken } from '../src/utils/jwt.js';
import { buildApp } from '../src/app.js';

let _app: ReturnType<typeof buildApp> | null = null;
export const getApp = () => {
  if (!_app) _app = buildApp();
  return _app;
};

let counter = 0;

export const newEmail = (label = 'user'): string =>
  `${label}-${Date.now()}-${counter++}@test.sportify.dev`;

export const createPlayer = async (overrides?: { name?: string; email?: string }) => {
  const email = overrides?.email ?? newEmail('player');
  const password = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.create({
    data: {
      name: overrides?.name ?? 'Test Player',
      email,
      password,
      role: 'PLAYER',
    },
  });
  return { user, token: generateToken({ id: user.id, role: user.role }) };
};

export const createMerchantWithVenue = async () => {
  const password = await bcrypt.hash('Password123!', 10);
  const merchant = await prisma.user.create({
    data: { name: 'Test Merchant', email: newEmail('merchant'), password, role: 'MERCHANT' },
  });
  const sport = await prisma.sport.upsert({
    where: { name: 'Football' },
    update: {},
    create: { name: 'Football' },
  });
  const venue = await prisma.venue.create({
    data: {
      name: `Test Venue ${Date.now()}-${counter++}`,
      location: 'Test Location',
      city: 'Bengaluru',
      images: [],
      amenities: [],
      lat: 12.97,
      lng: 77.59,
      openingHour: 6,
      closingHour: 22,
      slotDurationMinutes: 60,
      pricePerHour: 500,
      ownerId: merchant.id,
      sports: { connect: { id: sport.id } },
    },
  });
  return { merchant, venue, sport };
};
