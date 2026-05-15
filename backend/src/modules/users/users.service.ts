import bcrypt from 'bcrypt';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  ChangePasswordInput,
  DeleteAccountInput,
  UpdateMeInput,
} from './users.validator.js';

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  bio: true,
  skill: true,
  role: true,
  loyaltyPoints: true,
  createdAt: true,
} as const;

export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_SELECT,
  });
  if (!user) throw new AppError(404, 'User not found');
  return user;
};

export const updateMeService = async (userId: string, input: UpdateMeInput) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: PUBLIC_USER_SELECT,
  });
  return user;
};

export const changePasswordService = async (userId: string, input: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');
  const ok = await bcrypt.compare(input.currentPassword, user.password);
  if (!ok) throw new AppError(400, 'Current password is incorrect');
  const hashed = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { ok: true };
};

export const exportMyDataService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookings: { include: { sport: true, venue: { select: { id: true, name: true } }, slot: true } },
      reviews: { include: { venue: { select: { id: true, name: true } } } },
      favorites: { include: { venue: { select: { id: true, name: true } } } },
      activitiesHosted: true,
      activitiesParticipated: true,
      notifications: true,
    },
  });
  if (!user) throw new AppError(404, 'User not found');
  // Strip password before returning.
  const { password: _password, ...safe } = user;
  return safe;
};

export const deleteMyAccountService = async (userId: string, input: DeleteAccountInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');
  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) throw new AppError(400, 'Password is incorrect');

  // Block deletion if the user still has upcoming bookings.
  const upcoming = await prisma.booking.count({
    where: { userId, status: { not: 'CANCELLED' }, slot: { endTime: { gt: new Date() } } },
  });
  if (upcoming > 0) {
    throw new AppError(
      400,
      'You have upcoming bookings. Cancel them before deleting your account.',
    );
  }

  // Merchants need to first delete or transfer their venues.
  const ownedVenues = await prisma.venue.count({ where: { ownerId: userId } });
  if (ownedVenues > 0) {
    throw new AppError(
      400,
      'You still own venues. Delete or transfer them before deleting your account.',
    );
  }

  await prisma.$transaction([
    prisma.favorite.deleteMany({ where: { userId } }),
    prisma.notification.deleteMany({ where: { userId } }),
    prisma.review.deleteMany({ where: { userId } }),
    // Past bookings are kept (anonymise via userId rewrite would be ideal,
    // but for MVP we delete; an audit-grade product would soft-delete and
    // null the user reference instead).
    prisma.booking.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return { ok: true };
};
