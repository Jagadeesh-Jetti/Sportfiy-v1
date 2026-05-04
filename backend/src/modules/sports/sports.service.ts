import { prisma } from '../../config/db.js';

export const listSportsService = async () => {
  return prisma.sport.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
};
