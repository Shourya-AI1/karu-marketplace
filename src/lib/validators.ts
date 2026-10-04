import { z } from 'zod';

export const emailSchema = z.string().email('Enter a valid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long');

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const addressSchema = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().min(8).max(15),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional().or(z.literal('')),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  postalCode: z.string().min(4).max(10),
  country: z.string().default('IN'),
});

export const productSchema = z.object({
  title: z.string().min(3, 'Title is too short').max(140),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  story: z.string().max(5000).optional().or(z.literal('')),
  price: z.number().int().positive('Price must be positive'),
  compareAtPrice: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  materials: z.string().optional(),
  origin: z.string().optional(),
  leadTimeDays: z.number().int().min(0).max(90).default(3),
  customizable: z.boolean().default(false),
  bulkAvailable: z.boolean().default(false),
  stock: z.number().int().min(0).default(0),
});

export const storeSchema = z.object({
  name: z.string().min(2).max(80),
  tagline: z.string().max(140).optional().or(z.literal('')),
  story: z.string().max(5000).optional().or(z.literal('')),
  region: z.string().max(80).optional().or(z.literal('')),
  craftType: z.string().max(80).optional().or(z.literal('')),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().or(z.literal('')),
  body: z.string().min(5, 'Review is too short').max(2000),
});

export const addToCartSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  notes: z.string().max(500).optional(),
});

export const checkoutSchema = z.object({
  addressId: z.string(),
});

export const searchSchema = z.object({
  q: z.string().max(120).optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['relevance', 'newest', 'price_asc', 'price_desc', 'rating']).default('relevance'),
  page: z.coerce.number().min(1).default(1),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type StoreInput = z.infer<typeof storeSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
