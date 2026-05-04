import bcrypt from 'bcrypt';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import { generateToken } from '../../utils/jwt.js';
import type { LoginInput, SignupInput } from './auth.validator.js';

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

export const signupService = async (input: SignupInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const hashed = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      phone: input.phone,
      role: input.role,
    },
    select: PUBLIC_USER_SELECT,
  });

  const token = generateToken({ id: user.id, role: user.role });
  return { user, token };
};

export const loginService = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }
  const ok = await bcrypt.compare(input.password, user.password);
  if (!ok) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = generateToken({ id: user.id, role: user.role });
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
};

export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_SELECT,
  });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return user;
};
