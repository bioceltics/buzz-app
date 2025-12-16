import { z } from 'zod';

const dayHoursSchema = z.object({
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  closed: z.boolean().optional(),
});

export const venueHoursSchema = z.object({
  monday: dayHoursSchema.optional(),
  tuesday: dayHoursSchema.optional(),
  wednesday: dayHoursSchema.optional(),
  thursday: dayHoursSchema.optional(),
  friday: dayHoursSchema.optional(),
  saturday: dayHoursSchema.optional(),
  sunday: dayHoursSchema.optional(),
});

export const createVenueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  type: z.enum(['restaurant', 'bar', 'club', 'hotel', 'cafe', 'lounge']),
  description: z.string().max(1000).optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postal_code: z.string().min(3, 'Postal code is required'),
  country: z.string().default('Canada'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logo_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
  hours: venueHoursSchema.optional(),
  amenities: z.array(z.string()).default([]),
  price_range: z.number().min(1).max(4).default(2),
});

export const updateVenueSchema = createVenueSchema.partial();

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
export type VenueHoursInput = z.infer<typeof venueHoursSchema>;
