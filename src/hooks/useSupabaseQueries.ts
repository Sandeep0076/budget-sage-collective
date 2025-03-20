
/**
 * Custom hooks for Supabase queries
 * 
 * This file contains hooks for fetching and managing data from Supabase,
 * including transactions, categories, budgets, and user profiles.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types based on our database schema
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  currency: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  color: string;
  icon: string | null;
  is_income: boolean;
  is_default: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category_id: string | null;
  transaction_date: string;
  transaction_type: 'expense' | 'income';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  month: number;
  year: number;
}

/**
 * Fetches the current user's profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();
        
      if (error) throw error;
      
      return data as Profile;
    },
  });
};

/**
 * Fetches categories, including both default categories and user-created ones
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return data as Category[];
    },
  });
};

/**
 * Fetches transactions with optional filters
 * @param filters Optional filters for querying transactions
 */
export const useTransactions = (filters?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'expense' | 'income';
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .order('transaction_date', { ascending: false });
      
      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      
      if (filters?.type) {
        query = query.eq('transaction_type', filters.type);
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data;
    },
  });
};

/**
 * Creates a new transaction
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...transaction,
            user_id: user.user.id,
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction created',
        description: 'Your transaction has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Fetches budget data for a specific month and year
 * @param month Month (1-12)
 * @param year Year (e.g. 2023)
 */
export const useBudgets = (month: number, year: number) => {
  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('month', month)
        .eq('year', year);
      
      if (error) throw error;
      
      return data;
    },
  });
};

/**
 * Creates or updates a budget for a specific category, month, and year
 */
export const useUpsertBudget = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (budget: {
      id?: string;
      category_id: string;
      amount: number;
      month: number;
      year: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .upsert([
          {
            id: budget.id,
            user_id: user.user.id,
            category_id: budget.category_id,
            amount: budget.amount,
            month: budget.month,
            year: budget.year,
          },
        ])
        .select();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['budgets', variables.month, variables.year] 
      });
      toast({
        title: 'Budget updated',
        description: 'Your budget has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating budget',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Calculates the spending for each category within a specific month and year
 * @param month Month (1-12)
 * @param year Year (e.g. 2023)
 */
export const useMonthlySpending = (month: number, year: number) => {
  return useQuery({
    queryKey: ['monthlySpending', month, year],
    queryFn: async () => {
      // Create date range for the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          transaction_type,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);
      
      if (error) throw error;
      
      // Process data to get spending by category
      const spendingByCategory = data.reduce((acc: any, transaction) => {
        const categoryId = transaction.categories?.id || 'uncategorized';
        const categoryName = transaction.categories?.name || 'Uncategorized';
        const categoryColor = transaction.categories?.color || '#94a3b8';
        const amount = Number(transaction.amount);
        
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: categoryName,
            categoryId,
            color: categoryColor,
            amount: 0,
          };
        }
        
        if (transaction.transaction_type === 'expense') {
          acc[categoryId].amount += amount;
        }
        
        return acc;
      }, {});
      
      return Object.values(spendingByCategory);
    },
  });
};

/**
 * Calculates monthly income and expenses for a specified year
 * @param year Year (e.g. 2023)
 */
export const useYearlyFinancials = (year: number) => {
  return useQuery({
    queryKey: ['yearlyFinancials', year],
    queryFn: async () => {
      const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
      const endDate = new Date(year, 11, 31).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, transaction_date, transaction_type')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);
      
      if (error) throw error;
      
      // Initialize monthly data
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
        income: 0,
        expenses: 0,
      }));
      
      // Process data to get monthly income and expenses
      data.forEach(transaction => {
        const date = new Date(transaction.transaction_date);
        const monthIndex = date.getMonth();
        const amount = Number(transaction.amount);
        
        if (transaction.transaction_type === 'income') {
          months[monthIndex].income += amount;
        } else {
          months[monthIndex].expenses += amount;
        }
      });
      
      return months;
    },
  });
};
