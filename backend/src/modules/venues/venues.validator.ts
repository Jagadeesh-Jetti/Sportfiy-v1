import { z } from 'zod';

const HOUR = z.coerce.number().int().min(0).max(24);

export const createVenueSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).optional(),
    location: z.string().trim().min(2).max(200),
    city: z.string().trim().min(1).max(80).optional(),
    address: z.string().trim().max(300).optional(),
    images: z.array(z.string().trim().url()).max(20).default([]),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    openingHour: HOUR,
    closingHour: HOUR,
    slotDurationMinutes: z.coerce.number().int().min(15).max(240),
    pricePerHour: z.number().min(0).optional(),
    sportIds: z.array(z.string().uuid()).min(1, 'Pick at least one sport'),
  })
  .refine((d) => d.closingHour > d.openingHour, {
    message: 'closingHour must be after openingHour',
    path: ['closingHour'],
  });

export const updateVenueSchema = createVenueSchema
  .innerType()
  .partial()
  .refine(
    (d) => !(d.openingHour !== undefined && d.closingHour !== undefined && d.closingHour <= d.openingHour),
    { message: 'closingHour must be after openingHour', path: ['closingHour'] },
  );

export const listVenuesQuerySchema = z.object({
  sport: z.string().trim().optional(),
  city: z.string().trim().optional(),
  q: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const venueIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
export type ListVenuesQuery = z.infer<typeof listVenuesQuerySchema>;
