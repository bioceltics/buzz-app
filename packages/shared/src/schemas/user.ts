import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const phoneSignInSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});

export const verifyOtpSchema = z.object({
  phone: z.string(),
  token: z.string().length(6, 'OTP must be 6 digits'),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  avatar_url: z.string().url().optional(),
  notification_preferences: z
    .object({
      deals: z.boolean(),
      events: z.boolean(),
      messages: z.boolean(),
      nearby_alerts: z.boolean(),
      marketing: z.boolean(),
    })
    .optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PhoneSignInInput = z.infer<typeof phoneSignInSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
