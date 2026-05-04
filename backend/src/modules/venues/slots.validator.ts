import { z } from 'zod';

const HOUR = z.coerce.number().int().min(0).max(24);

export const defineSlotsSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startHour: HOUR,
    endHour: HOUR,
    slotDurationMinutes: z.coerce.number().int().min(15).max(240).optional(),
  })
  .refine((d) => d.endHour > d.startHour, {
    message: 'endHour must be after startHour',
    path: ['endHour'],
  });

export const defineSlotsBulkSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startHour: HOUR,
    endHour: HOUR,
    slotDurationMinutes: z.coerce.number().int().min(15).max(240).optional(),
  })
  .refine((d) => d.endHour > d.startHour, {
    message: 'endHour must be after startHour',
    path: ['endHour'],
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export type DefineSlotsInput = z.infer<typeof defineSlotsSchema>;
export type DefineSlotsBulkInput = z.infer<typeof defineSlotsBulkSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
