import { z } from 'zod';

export const createBookingSchema = z.object({
  slotId: z.string().uuid(),
  sportId: z.string().uuid(),
});

export const bookingIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const venueIdParamSchema = z.object({
  venueId: z.string().uuid(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
