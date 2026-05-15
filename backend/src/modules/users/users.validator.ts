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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirm: z.literal('DELETE'),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
