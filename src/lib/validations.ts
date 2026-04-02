import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Enter a valid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
  remember: z.boolean().optional(),
});

export const signupSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(100),
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Enter a valid email' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirm_password: z.string().min(1, { message: 'Please confirm your password' }),
  terms: z.boolean().refine(val => val === true, { message: 'You must accept the terms & conditions' }),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Enter a valid email' }),
});

export const formTitleSchema = z.object({
  title: z.string().min(1, { message: 'Form title is required' }).max(200, { message: 'Title too long' }),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, { message: 'Name too short' }).max(100),
});

export const changePasswordSchema = z.object({
  new_password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[a-zA-Z]/, { message: 'Must contain at least one letter' })
    .regex(/[0-9]/, { message: 'Must contain at least one number' }),
  confirm_password: z.string().min(1, { message: 'Please confirm your password' }),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
