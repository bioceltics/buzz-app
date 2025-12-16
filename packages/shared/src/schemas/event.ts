import { z } from 'zod';

// Base schema without refinements (for partial/update operations)
const eventBaseSchema = z.object({
  venue_id: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(1000),
  type: z.enum(['live_music', 'dj', 'comedy', 'trivia', 'sports', 'themed', 'special', 'other']),
  image_url: z.string().url().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime().optional(),
  cover_charge: z.number().min(0).optional(),
  is_free: z.boolean().default(true),
  age_restriction: z.number().min(0).max(21).optional(),
  dress_code: z.string().max(200).optional(),
  capacity: z.number().int().positive().optional(),
  is_active: z.boolean().default(true),
});

// Full create schema with time validation
export const createEventSchema = eventBaseSchema.refine(
  (data) => !data.end_time || new Date(data.end_time) > new Date(data.start_time),
  { message: 'End time must be after start time', path: ['end_time'] }
);

// Update schema (partial, without venue_id)
export const updateEventSchema = eventBaseSchema.partial().omit({ venue_id: true });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
