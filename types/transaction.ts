export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  createdAt: Date;
}

export interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM format
  createdAt: Date;
}

export interface BudgetFormData {
  category: string;
  amount: number;
  month: string;
}

export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Groceries',
  'Rent',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];