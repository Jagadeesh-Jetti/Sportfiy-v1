import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import type { UpdateMeInput } from './users.validator.js';

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
