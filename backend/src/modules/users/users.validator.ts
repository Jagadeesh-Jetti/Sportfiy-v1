import { z } from 'zod';

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    bio: z.string().trim().max(500).optional(),
    avatarUrl: z.string().trim().url().optional(),
    skill: z.enum(['BEGINNER', 'INTERMEDIATE', 'PRO']).optional(),
  })
  .strict();

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
