import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import type { CreateActivityInput, ListActivitiesQuery } from './activities.validator.js';

const ACTIVITY_LIST_INCLUDE = {
  sport: true,
  venue: { select: { id: true, name: true, location: true, city: true, images: true } },
  host: { select: { id: true, name: true, avatarUrl: true } },
  participants: { select: { id: true, name: true, avatarUrl: true } },
} as const;

export const listActivitiesService = async (query: ListActivitiesQuery) => {
  const where: Prisma.ActivityWhereInput = { privacy: 'PUBLIC' };

  if (query.upcoming !== false) {
    where.startsAt = { gte: new Date() };
  }
  if (query.sport) {
    where.sport = { name: { equals: query.sport, mode: 'insensitive' } };
  }
  if (query.city) {
    where.venue = { city: { equals: query.city, mode: 'insensitive' } };
  }

  return prisma.activity.findMany({
    where,
    include: ACTIVITY_LIST_INCLUDE,
    orderBy: { startsAt: 'asc' },
    take: 60,
  });
};

export const getActivityService = async (id: string) => {
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: ACTIVITY_LIST_INCLUDE,
  });
  if (!activity) throw new AppError(404, 'Activity not found');
  return activity;
};

export const createActivityService = async (
  hostId: string,
  input: CreateActivityInput,
) => {
  if (input.endsAt && input.endsAt <= input.startsAt) {
    throw new AppError(400, 'endsAt must be after startsAt');
  }
  return prisma.activity.create({
    data: {
      title: input.title,
      description: input.description,
      sportId: input.sportId,
      venueId: input.venueId,
      hostId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      capacity: input.capacity,
      price: input.price,
      privacy: input.privacy,
      participants: { connect: [{ id: hostId }] },
    },
    include: ACTIVITY_LIST_INCLUDE,
  });
};

export const joinActivityService = async (userId: string, activityId: string) => {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { participants: { select: { id: true } } },
  });
  if (!activity) throw new AppError(404, 'Activity not found');
  if (activity.startsAt <= new Date()) throw new AppError(400, 'This activity has already started');
  if (activity.participants.some((p) => p.id === userId)) {
    throw new AppError(409, "You're already in this game");
  }
  if (activity.participants.length >= activity.capacity) {
    throw new AppError(409, 'This game is full');
  }
  return prisma.activity.update({
    where: { id: activityId },
    data: { participants: { connect: { id: userId } } },
    include: ACTIVITY_LIST_INCLUDE,
  });
};

export const leaveActivityService = async (userId: string, activityId: string) => {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, hostId: true },
  });
  if (!activity) throw new AppError(404, 'Activity not found');
  if (activity.hostId === userId) {
    throw new AppError(400, 'Host cannot leave — cancel the activity instead');
  }
  return prisma.activity.update({
    where: { id: activityId },
    data: { participants: { disconnect: { id: userId } } },
    include: ACTIVITY_LIST_INCLUDE,
  });
};

export const cancelActivityService = async (userId: string, activityId: string) => {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, hostId: true },
  });
  if (!activity) throw new AppError(404, 'Activity not found');
  if (activity.hostId !== userId) throw new AppError(403, 'Only the host can cancel');
  await prisma.activity.delete({ where: { id: activityId } });
  return { id: activityId };
};

export const listMyActivitiesService = async (userId: string) => {
  return prisma.activity.findMany({
    where: { participants: { some: { id: userId } } },
    include: ACTIVITY_LIST_INCLUDE,
    orderBy: { startsAt: 'asc' },
  });
};
