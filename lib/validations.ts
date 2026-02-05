import { z } from 'zod';

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Document validations
export const documentUploadSchema = z.object({
  file: z.custom<File>().refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB'),
  folderId: z.string().optional(),
});

export const documentUpdateSchema = z.object({
  filename: z.string().min(1, 'Filename is required').optional(),
  folderId: z.string().optional().nullable(),
});

// Folder validations
export const folderCreateSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255, 'Folder name is too long'),
  parentId: z.string().optional().nullable(),
});

export const folderUpdateSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255, 'Folder name is too long').optional(),
  parentId: z.string().optional().nullable(),
});

// Tag validations
export const tagCreateSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
});

// User validations
export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['ADMIN', 'USER', 'VIEWER']).optional(),
  active: z.boolean().optional(),
});
