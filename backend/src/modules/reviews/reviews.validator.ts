import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const replyReviewSchema = z.object({
  reply: z.string().trim().min(1).max(1000),
});

export const venueIdParamSchema = z.object({ venueId: z.string().uuid() });
export const reviewIdParamSchema = z.object({ id: z.string().uuid() });

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReplyReviewInput = z.infer<typeof replyReviewSchema>;
