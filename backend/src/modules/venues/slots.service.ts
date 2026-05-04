import { addDays, addMinutes } from 'date-fns';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  AvailabilityQuery,
  DefineSlotsBulkInput,
  DefineSlotsInput,
} from './slots.validator.js';

const dateAtMidnightUTC = (yyyyMmDd: string): Date => new Date(`${yyyyMmDd}T00:00:00.000Z`);
const timeAtUTC = (yyyyMmDd: string, hour: number): Date =>
  new Date(`${yyyyMmDd}T${String(hour).padStart(2, '0')}:00:00.000Z`);

const generateSlotsForDate = (
  venueId: string,
  yyyyMmDd: string,
  startHour: number,
  endHour: number,
  slotDurationMinutes: number,
): Prisma.SlotCreateManyInput[] => {
  const data: Prisma.SlotCreateManyInput[] = [];
  const date = dateAtMidnightUTC(yyyyMmDd);
  let current = timeAtUTC(yyyyMmDd, startHour);
  const end = timeAtUTC(yyyyMmDd, endHour);
  while (current < end) {
    const next = addMinutes(current, slotDurationMinutes);
    if (next > end) break;
    data.push({ venueId, date, startTime: current, endTime: next });
    current = next;
  }
  return data;
};

const assertVenueOwnership = async (venueId: string, ownerId: string) => {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { ownerId: true, slotDurationMinutes: true },
  });
  if (!venue) throw new AppError(404, 'Venue not found');
  if (venue.ownerId !== ownerId) throw new AppError(403, 'You do not own this venue');
  return venue;
};

export const defineSlotsService = async (
  venueId: string,
  ownerId: string,
  input: DefineSlotsInput,
) => {
  const venue = await assertVenueOwnership(venueId, ownerId);
  const duration = input.slotDurationMinutes ?? venue.slotDurationMinutes;

  const data = generateSlotsForDate(
    venueId,
    input.date,
    input.startHour,
    input.endHour,
    duration,
  );

  const result = await prisma.slot.createMany({ data, skipDuplicates: true });
  return { date: input.date, attempted: data.length, created: result.count };
};

export const defineSlotsBulkService = async (
  venueId: string,
  ownerId: string,
  input: DefineSlotsBulkInput,
) => {
  const venue = await assertVenueOwnership(venueId, ownerId);
  const duration = input.slotDurationMinutes ?? venue.slotDurationMinutes;

  const start = dateAtMidnightUTC(input.startDate);
  const end = dateAtMidnightUTC(input.endDate);
  const allData: Prisma.SlotCreateManyInput[] = [];

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const yyyyMmDd = cursor.toISOString().slice(0, 10);
    allData.push(
      ...generateSlotsForDate(venueId, yyyyMmDd, input.startHour, input.endHour, duration),
    );
  }

  const result = await prisma.slot.createMany({ data: allData, skipDuplicates: true });
  return {
    startDate: input.startDate,
    endDate: input.endDate,
    attempted: allData.length,
    created: result.count,
  };
};

export const getAvailabilityService = async (venueId: string, query: AvailabilityQuery) => {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { id: true, name: true },
  });
  if (!venue) throw new AppError(404, 'Venue not found');

  const date = dateAtMidnightUTC(query.date);

  const slots = await prisma.slot.findMany({
    where: { venueId, date },
    orderBy: { startTime: 'asc' },
    include: {
      bookings: {
        where: { status: { not: 'CANCELLED' } },
        select: { id: true },
      },
    },
  });

  return {
    date: query.date,
    slots: slots.map((s) => ({
      id: s.id,
      venueId: s.venueId,
      date: s.date.toISOString(),
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      isBooked: s.bookings.length > 0,
    })),
  };
};
