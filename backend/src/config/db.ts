import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export const connectDB = async () => {
  await prisma.$connect();
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};
