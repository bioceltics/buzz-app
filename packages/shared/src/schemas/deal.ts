import { z } from 'zod';

// Base schema without refinements (for partial/update operations)
const dealBaseSchema = z.object({
  venue_id: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500),
  type: z.enum(['happy_hour', 'flash_deal', 'daily_special', 'event_special', 'recurring']),
  discount_type: z.enum(['percentage', 'fixed', 'bogo', 'free_item']),
  discount_value: z.number().min(0).optional(),
  original_price: z.number().min(0).optional(),
  discounted_price: z.number().min(0).optional(),
  terms: z.string().max(500).optional(),
  image_url: z.string().url().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  max_redemptions: z.number().int().positive().optional(),
  recurring_days: z.array(z.number().min(0).max(6)).optional(),
  is_active: z.boolean().default(true),
});

// Full create schema with time validation
export const createDealSchema = dealBaseSchema.refine(
  (data) => new Date(data.end_time) > new Date(data.start_time),
  { message: 'End time must be after start time', path: ['end_time'] }
);

// Update schema (partial, without venue_id)
export const updateDealSchema = dealBaseSchema.partial().omit({ venue_id: true });

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
