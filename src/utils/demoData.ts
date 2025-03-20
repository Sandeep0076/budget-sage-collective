
/**
 * Demo data for initial UI development
 */

// Transaction categories with icons
export const categories = [
  { id: 'food', name: 'Food & Dining', icon: 'utensils' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'housing', name: 'Housing', icon: 'home' },
  { id: 'transportation', name: 'Transportation', icon: 'car' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film' },
  { id: 'healthcare', name: 'Healthcare', icon: 'heart-pulse' },
  { id: 'utilities', name: 'Utilities', icon: 'plug' },
  { id: 'income', name: 'Income', icon: 'wallet' },
  { id: 'other', name: 'Other', icon: 'more-horizontal' },
];

// Transaction types
export type TransactionType = 'expense' | 'income' | 'transfer';

// Transaction interface
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  categoryId: string;
  type: TransactionType;
  tags?: string[];
  notes?: string;
}

// Sample transactions
export const transactions: Transaction[] = [
  {
    id: 't1',
    date: '2023-06-01',
    amount: 1520.00,
    description: 'Monthly Salary',
    categoryId: 'income',
    type: 'income',
  },
  {
    id: 't2',
    date: '2023-06-02',
    amount: 42.50,
    description: 'Grocery Shopping',
    categoryId: 'food',
    type: 'expense',
    tags: ['groceries'],
  },
  {
    id: 't3',
    date: '2023-06-03',
    amount: 9.99,
    description: 'Streaming Service',
    categoryId: 'entertainment',
    type: 'expense',
    tags: ['subscription'],
  },
  {
    id: 't4',
    date: '2023-06-04',
    amount: 35.00,
    description: 'Gas Station',
    categoryId: 'transportation',
    type: 'expense',
  },
  {
    id: 't5',
    date: '2023-06-05',
    amount: 120.00,
    description: 'Electric Bill',
    categoryId: 'utilities',
    type: 'expense',
    tags: ['bills'],
  },
  {
    id: 't6',
    date: '2023-06-07',
    amount: 65.28,
    description: 'Restaurant Dinner',
    categoryId: 'food',
    type: 'expense',
    tags: ['eating out'],
  },
  {
    id: 't7',
    date: '2023-06-10',
    amount: 89.99,
    description: 'New Shoes',
    categoryId: 'shopping',
    type: 'expense',
  },
  {
    id: 't8',
    date: '2023-06-12',
    amount: 25.00,
    description: 'Mobile Phone Bill',
    categoryId: 'utilities',
    type: 'expense',
    tags: ['bills'],
  },
  {
    id: 't9',
    date: '2023-06-15',
    amount: 1520.00,
    description: 'Monthly Salary',
    categoryId: 'income',
    type: 'income',
  },
  {
    id: 't10',
    date: '2023-06-18',
    amount: 50.00,
    description: 'Concert Tickets',
    categoryId: 'entertainment',
    type: 'expense',
  },
];

// Budget interface
export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

// Sample budgets
export const budgets: Budget[] = [
  {
    id: 'b1',
    categoryId: 'food',
    amount: 500,
    spent: 107.78,
    period: 'monthly',
  },
  {
    id: 'b2',
    categoryId: 'transportation',
    amount: 200,
    spent: 35,
    period: 'monthly',
  },
  {
    id: 'b3',
    categoryId: 'entertainment',
    amount: 100,
    spent: 59.99,
    period: 'monthly',
  },
  {
    id: 'b4',
    categoryId: 'shopping',
    amount: 150,
    spent: 89.99,
    period: 'monthly',
  },
  {
    id: 'b5',
    categoryId: 'utilities',
    amount: 300,
    spent: 145,
    period: 'monthly',
  },
];

// Monthly summary data for charts
export const monthlyData = [
  { month: 'Jan', income: 3000, expenses: 2300 },
  { month: 'Feb', income: 3200, expenses: 2800 },
  { month: 'Mar', income: 3150, expenses: 2950 },
  { month: 'Apr', income: 3400, expenses: 3100 },
  { month: 'May', income: 3300, expenses: 2600 },
  { month: 'Jun', income: 3500, expenses: 2900 },
];

// Category spending data for pie chart
export const categorySpending = [
  { category: 'Food & Dining', amount: 520, color: '#38bdf8' },
  { category: 'Shopping', amount: 430, color: '#a78bfa' },
  { category: 'Housing', amount: 1200, color: '#fb7185' },
  { category: 'Transportation', amount: 350, color: '#34d399' },
  { category: 'Entertainment', amount: 270, color: '#fbbf24' },
  { category: 'Healthcare', amount: 180, color: '#f472b6' },
  { category: 'Utilities', amount: 390, color: '#60a5fa' },
  { category: 'Other', amount: 120, color: '#94a3b8' },
];
