import { z } from 'zod';

export const CategoryEnum = z.enum([
  'FOOD_DINING',
  'TRANSPORTATION',
  'SHOPPING',
  'ENTERTAINMENT',
  'BILLS_UTILITIES',
  'HEALTHCARE',
  'TRAVEL',
  'EDUCATION',
  'GROCERIES',
  'RENT',
  'OTHER'
]);

export const TransactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100, 'Description too long'),
  amount: z.number().min(0.01, 'Amount must be positive').max(999999, 'Amount too large'),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  category: CategoryEnum,
});

export const BudgetSchema = z.object({
  category: CategoryEnum,
  amount: z.number().min(0.01, 'Amount must be positive').max(999999, 'Amount too large'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

export const UpdateTransactionSchema = TransactionSchema.partial().extend({
  id: z.string().cuid(),
});

export const UpdateBudgetSchema = BudgetSchema.partial().extend({
  id: z.string().cuid(),
});

// Category mapping for frontend compatibility
export const CATEGORY_MAPPING = {
  'Food & Dining': 'FOOD_DINING',
  'Transportation': 'TRANSPORTATION',
  'Shopping': 'SHOPPING',
  'Entertainment': 'ENTERTAINMENT',
  'Bills & Utilities': 'BILLS_UTILITIES',
  'Healthcare': 'HEALTHCARE',
  'Travel': 'TRAVEL',
  'Education': 'EDUCATION',
  'Groceries': 'GROCERIES',
  'Rent': 'RENT',
  'Other': 'OTHER',
} as const;

export const REVERSE_CATEGORY_MAPPING = Object.fromEntries(
  Object.entries(CATEGORY_MAPPING).map(([key, value]) => [value, key])
) as Record<string, string>;