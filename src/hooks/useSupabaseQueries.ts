/**
 * Custom hooks for Supabase queries
 * 
 * This file contains hooks for fetching and managing data from Supabase,
 * including transactions, categories, budgets, user profiles, and recurring transactions.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
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

export type AIConfig = Database['public']['Tables']['ai_config']['Row']

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

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category_id: string | null;
  transaction_type: 'expense' | 'income';
  frequency: RecurringFrequency;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
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
      
      console.log('Creating transaction:', {
        ...transaction,
        user_id: user.user.id,
      });
      
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
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      // Get the month and year from the transaction date
      const transactionDate = new Date(variables.transaction_date);
      const month = transactionDate.getMonth() + 1; // JavaScript months are 0-indexed
      const year = transactionDate.getFullYear();
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySpending', month, year] });
      queryClient.invalidateQueries({ queryKey: ['yearlyFinancials', year] });
      
      toast({
        title: 'Transaction created',
        description: 'Your transaction has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Transaction creation error:', error);
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
      
      console.log('Upserting budget:', {
        ...budget,
        user_id: user.user.id,
      });
      
      // Fixed: Remove id if it's undefined to let Supabase generate a new one
      const budgetData = {
        user_id: user.user.id,
        category_id: budget.category_id,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
      };
      
      // Only add id to the object if it actually exists
      if (budget.id && budget.id !== 'undefined') {
        Object.assign(budgetData, { id: budget.id });
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .upsert([budgetData])
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
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
      console.error('Budget update error:', error);
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
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Not authenticated');
      }
      
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
        .eq('user_id', userData.user.id)
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
    // Add caching and stale-while-revalidate settings
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache data for 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Use cached data on mount if available
    placeholderData: (previousData) => previousData // Keep showing old data while fetching new data
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
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Not authenticated');
      }
      
      const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
      const endDate = new Date(year, 11, 31).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, transaction_date, transaction_type')
        .eq('user_id', userData.user.id)
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
    // Add caching and stale-while-revalidate settings
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Cache data for 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Use cached data on mount if available
    placeholderData: (previousData) => previousData // Keep showing old data while fetching new data
  });
};

/**
 * Fetches recurring transactions for the current user
 */
export const useRecurringTransactions = () => {
  return useQuery({
    queryKey: ['recurringTransactions'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            color,
            icon
          )
        `)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      return data as RecurringTransaction[];
    },
  });
};

/**
 * Creates a new recurring transaction
 */
export const useCreateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      console.log('Creating recurring transaction:', {
        ...transaction,
        user_id: user.user.id,
      });
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([
          {
            ...transaction,
            user_id: user.user.id,
          },
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate recurring transactions query to refresh data
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      
      toast({
        title: 'Recurring transaction created',
        description: 'Your recurring transaction has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Recurring transaction creation error:', error);
      toast({
        title: 'Error creating recurring transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Updates an existing recurring transaction
 */
export const useUpdateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Partial<RecurringTransaction> & { id: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      console.log('Updating recurring transaction:', transaction);
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(transaction)
        .eq('id', transaction.id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      
      toast({
        title: 'Recurring transaction updated',
        description: 'Your recurring transaction has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Recurring transaction update error:', error);
      toast({
        title: 'Error updating recurring transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Deletes a recurring transaction
 */
export const useDeleteRecurringTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      
      toast({
        title: 'Recurring transaction deleted',
        description: 'Your recurring transaction has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Recurring transaction deletion error:', error);
      toast({
        title: 'Error deleting recurring transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Updates the user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Fetches the AI configuration for the current user
 */
export const useAIConfig = () => {
  return useQuery({
    queryKey: ['aiConfig'],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          throw new Error('Not authenticated');
        }
        
        const { data, error } = await supabase
          .from('ai_config')
          .select('*')
          .eq('user_id', user.user.id)
          .single();
        
        if (error) {
          // Handle table doesn't exist error
          if (error.code === '42P01') {
            console.warn('AI config table does not exist yet');
            return null;
          }
          
          // Handle no rows returned
          if (error.code === 'PGRST116') {
            return null;
          }
          
          console.error('Error fetching AI config:', error);
          throw error;
        }
        
        return data as AIConfig;
      } catch (error) {
        console.error('Error in useAIConfig:', error);
        return null; // Return null instead of throwing to prevent app crashes
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on failure
  });
};

/**
 * Saves or updates the AI configuration for the current user
 */
export const useSaveAIConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (configData: {
      provider: string;
      api_key: string;
      model_name: string;
    }) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user.user) {
          throw new Error('Not authenticated');
        }
        
        // Try to check if config already exists
        try {
          const { data: existingConfig, error: checkError } = await supabase
            .from('ai_config')
            .select('id')
            .eq('user_id', user.user.id)
            .single();
          
          // If table doesn't exist, we'll catch it in the outer try/catch
          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking AI config:', checkError);
            throw checkError;
          }
          
          let result;
          if (existingConfig) {
            // Update existing config
            const { data, error } = await supabase
              .from('ai_config')
              .update({
                ...configData,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingConfig.id)
              .select()
              .single();
            
            if (error) {
              console.error('Error updating AI config:', error);
              throw error;
            }
            result = data;
          } else {
            // Create new config
            const { data, error } = await supabase
              .from('ai_config')
              .insert({
                user_id: user.user.id,
                ...configData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();
            
            if (error) {
              console.error('Error creating AI config:', error);
              throw error;
            }
            result = data;
          }
          
          return result;
        } catch (innerError: any) {
          // If table doesn't exist, inform the user
          if (innerError.code === '42P01') {
            toast({
              title: 'Database setup required',
              description: 'The AI configuration table needs to be created in your database.',
              variant: 'destructive',
            });
          }
          throw innerError;
        }
      } catch (error: any) {
        console.error('Error in useSaveAIConfig:', error);
        // Re-throw to trigger onError
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiConfig'] });
      toast({
        title: 'AI configuration saved',
        description: 'Your AI settings have been saved successfully.',
      });
    },
    onError: (error: any) => {
      console.error('AI config save error:', error);
      toast({
        title: 'Error saving AI configuration',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
};
