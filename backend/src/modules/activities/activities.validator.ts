import { z } from 'zod';

export const createActivitySchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional(),
  sportId: z.string().uuid(),
  venueId: z.string().uuid().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  capacity: z.coerce.number().int().min(2).max(50),
  price: z.coerce.number().min(0).default(0),
  privacy: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});

export const listActivitiesQuerySchema = z.object({
  sport: z.string().trim().optional(),
  city: z.string().trim().optional(),
  upcoming: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => v !== 'false'),
});

export const activityIdParamSchema = z.object({ id: z.string().uuid() });

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>;
