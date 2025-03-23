
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Interface for Transactions
interface Transaction {
  id: string;
  created_at?: string;
  user_id: string;
  description: string;
  amount: number;
  transaction_type: string;
  transaction_date?: string;
  notes?: string;
  category_id?: string;
}

// Interface for Bills
interface Bill {
  id: string;
  created_at?: string;
  user_id: string;
  name: string;
  due_date: string;
  amount: number;
  recurring: boolean;
  frequency?: string;
  notes?: string;
  status?: string;
  category_id?: string;
}

// Interface for Budgets
interface Budget {
  id: string;
  created_at?: string;
  user_id: string;
  category_id?: string;
  amount: number;
  month: number;
  year: number;
}

// Interface for Categories
interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  is_income?: boolean;
  is_default?: boolean;
  user_id?: string;
}

// Interface for Profile
interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  currency?: string;
}

// Interface for AI Config
interface AIConfig {
  id?: string;
  user_id: string;
  provider: string;
  api_key: string;
  model_name: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for Recurring Transaction
export interface RecurringTransaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  transaction_type: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string;
  notes?: string;
  category_id?: string;
}

// Define RecurringFrequency type
export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

// Transactions Hooks
export const useTransactions = (options?: { limit?: number }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchTransactions = async () => {
    if (!user) return [];

    let query = supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return data;
  };

  const addTransaction = useMutation({
    mutationFn: async (transactionData: Omit<Transaction, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User must be logged in to add a transaction');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          user_id: user.id,
        })
        .select();

      if (error) {
        console.error('Error adding transaction:', error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction', {
        description: error.message,
      });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Transaction>) => {
      if (!user) throw new Error('User must be logged in to update a transaction');

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }

      return data ? data[0] : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction', {
        description: error.message,
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User must be logged in to delete a transaction');

      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error deleting transaction:', error);
        throw error;
      }

      return data ? data[0] : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction', {
        description: error.message,
      });
    },
  });

  // Create a query function that can be used directly
  const useTransactionsQuery = (params?: { limit?: number }) => 
    useQuery({
      queryKey: ['transactions', user?.id, params],
      queryFn: fetchTransactions,
      enabled: !!user,
    });

  return {
    useTransactionsQuery,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    data: fetchTransactions,
    isLoading: false
  };
};

// Used directly by components
export const useCreateTransaction = () => {
  const { addTransaction } = useTransactions();
  return addTransaction;
};

// Bills Hooks
export const useBills = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchBills = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('bills')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }

    return data;
  };

  const addBill = useMutation({
    mutationFn: async (billData: Omit<Bill, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User must be logged in to add a bill');

      // Map from billData to match the database schema
      const dbBillData = {
        name: billData.name,
        amount: billData.amount,
        due_date: billData.due_date,
        recurring: billData.recurring,
        frequency: billData.frequency,
        status: billData.status || 'pending',
        notes: billData.notes,
        category_id: billData.category_id,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('bills')
        .insert(dbBillData)
        .select();

      if (error) {
        console.error('Error adding bill:', error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill added successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill', {
        description: error.message,
      });
    },
  });

  const updateBill = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Bill>) => {
      if (!user) throw new Error('User must be logged in to update a bill');

      const { data, error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error updating bill:', error);
        throw error;
      }

      return data ? data[0] : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill updated successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error updating bill:', error);
      toast.error('Failed to update bill', {
        description: error.message,
      });
    },
  });

  const deleteBill = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User must be logged in to delete a bill');

      const { data, error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error deleting bill:', error);
        throw error;
      }

      return data ? data[0] : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill deleted successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill', {
        description: error.message,
      });
    },
  });

  // Create a query function that can be used directly
  const useBillsQuery = () => 
    useQuery({
      queryKey: ['bills', user?.id],
      queryFn: fetchBills,
      enabled: !!user,
    });

  return {
    useBillsQuery,
    addBill,
    updateBill,
    deleteBill,
    data: fetchBills,
    isLoading: false
  };
};

// Used directly by components
export const useCreateBill = () => {
  const { addBill } = useBills();
  return addBill;
};

export const useUpdateBill = () => {
  const { updateBill } = useBills();
  return updateBill;
};

// Budgets Hooks
export const useBudgets = (month?: number, year?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchBudgets = async () => {
    if (!user) return [];

    let query = supabase
      .from('budgets')
      .select('*, categories(*)')
      .eq('user_id', user.id);
    
    if (month !== undefined && year !== undefined) {
      query = query.eq('month', month).eq('year', year);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }

    return data;
  };

  const addBudget = useMutation({
    mutationFn: async (budgetData: Omit<Budget, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User must be logged in to add a budget');

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          user_id: user.id,
        })
        .select();

      if (error) {
        console.error('Error adding budget:', error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget added successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget', {
        description: error.message,
      });
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Budget>) => {
      if (!user) throw new Error('User must be logged in to update a budget');

      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error updating budget:', error);
        throw error;
      }

      return data ? data[0] : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget updated successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget', {
        description: error.message,
      });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User must be logged in to delete a budget');

      const { data, error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error deleting budget:', error);
        throw error;
      }

      return data ? data[0] : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget', {
        description: error.message,
      });
    },
  });

  // For components that need the data directly
  return {
    useBudgetsQuery: () => useQuery({
      queryKey: ['budgets', user?.id, month, year],
      queryFn: fetchBudgets,
      enabled: !!user,
    }),
    addBudget,
    updateBudget,
    deleteBudget,
    data: fetchBudgets,
    isLoading: false
  };
};

// Used directly by components
export const useUpsertBudget = () => {
  const { updateBudget, addBudget } = useBudgets();
  
  return useMutation({
    mutationFn: async (budgetData: { 
      id?: string;
      category_id: string;
      amount: number;
      month: number;
      year: number;
    }) => {
      if (budgetData.id) {
        // Update existing budget
        return updateBudget.mutateAsync({
          id: budgetData.id,
          category_id: budgetData.category_id,
          amount: budgetData.amount,
          month: budgetData.month,
          year: budgetData.year
        });
      } else {
        // Add new budget
        return addBudget.mutateAsync({
          category_id: budgetData.category_id,
          amount: budgetData.amount,
          month: budgetData.month,
          year: budgetData.year
        });
      }
    }
  });
};

// Categories Hooks
export const useCategories = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get both user categories and default categories
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`);
        
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });
};

// Profile Hooks
export const useProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: Partial<Profile>) => {
      if (!user) throw new Error('User must be logged in to update profile');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();
        
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: PostgrestError) => {
      toast.error('Failed to update profile', {
        description: error.message,
      });
    },
  });
};

// AI Config Hooks
export const useAIConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['ai_config', user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        // Attempt to use the RPC function to get the AI config
        const { data, error } = await supabase.rpc('get_ai_config_for_user', {
          user_id_param: user.id,
        });

        if (error) {
          console.error('Error fetching AI config with RPC:', error);
          // Fallback to direct query
          const { data: directData, error: directError } = await supabase
            .from('ai_config')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (directError) {
            console.error('Error in direct AI config query:', directError);
            throw directError;
          }

          return directData;
        }

        return data;
      } catch (error) {
        console.error('Error in useAIConfig:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
};

export const useSaveAIConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: {
      provider: string;
      api_key: string;
      model_name: string;
      id?: string;
    }) => {
      if (!user) throw new Error('User must be logged in to save AI config');

      try {
        let result;

        if (config.id) {
          // Try to use RPC first
          try {
            const { data, error } = await supabase.rpc('update_ai_config', {
              config_id: config.id,
              new_provider: config.provider,
              new_api_key: config.api_key,
              new_model_name: config.model_name,
            });

            if (error) {
              throw error;
            }
            
            result = data;
          } catch (rpcError) {
            console.warn('RPC not available, falling back to direct update', rpcError);
            // Fallback to direct update
            const { data, error } = await supabase
              .from('ai_config')
              .update({
                provider: config.provider,
                api_key: config.api_key,
                model_name: config.model_name,
              })
              .eq('id', config.id)
              .select();

            if (error) throw error;
            result = data[0];
          }
        } else {
          // Try to use RPC first
          try {
            const { data, error } = await supabase.rpc('insert_ai_config', {
              for_user_id: user.id,
              new_provider: config.provider,
              new_api_key: config.api_key,
              new_model_name: config.model_name,
            });

            if (error) {
              throw error;
            }
            
            result = data;
          } catch (rpcError) {
            console.warn('RPC not available, falling back to direct insert', rpcError);
            // Fallback to direct insert
            const { data, error } = await supabase
              .from('ai_config')
              .insert({
                user_id: user.id,
                provider: config.provider,
                api_key: config.api_key,
                model_name: config.model_name,
              })
              .select();

            if (error) throw error;
            result = data[0];
          }
        }

        return result;
      } catch (error) {
        console.error('Error saving AI config:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_config'] });
      toast.success('AI configuration saved successfully');
    },
    onError: (error: PostgrestError) => {
      console.error('Error saving AI config:', error);
      toast.error('Failed to save AI configuration', {
        description: error.message,
      });
    },
  });
};

// Recurring Transactions Hooks
export const useRecurringTransactions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recurring_transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching recurring transactions:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateRecurringTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionData: Omit<RecurringTransaction, 'id' | 'user_id'>) => {
      if (!user) throw new Error('User must be logged in to create a recurring transaction');
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          ...transactionData,
          user_id: user.id,
        })
        .select();
        
      if (error) {
        console.error('Error creating recurring transaction:', error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast.success('Recurring transaction created successfully');
    },
    onError: (error: PostgrestError) => {
      toast.error('Failed to create recurring transaction', {
        description: error.message,
      });
    },
  });
};

export const useDeleteRecurringTransaction = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User must be logged in to delete a recurring transaction');
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
        
      if (error) {
        console.error('Error deleting recurring transaction:', error);
        throw error;
      }
      
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast.success('Recurring transaction deleted successfully');
    },
    onError: (error: PostgrestError) => {
      toast.error('Failed to delete recurring transaction', {
        description: error.message,
      });
    },
  });
};

// Analytics & Reports Hooks
export const useMonthlySpending = (month?: number, year?: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['monthly_spending', user?.id, month, year],
    queryFn: async () => {
      if (!user) return [];
      
      if (month === undefined || year === undefined) {
        const now = new Date();
        month = month ?? now.getMonth() + 1;
        year = year ?? now.getFullYear();
      }
      
      // Get the first and last day of the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .eq('transaction_type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);
        
      if (error) {
        console.error('Error fetching monthly spending:', error);
        throw error;
      }
      
      // Process and aggregate data by category
      const categoryMap = new Map();
      
      data?.forEach(transaction => {
        const categoryId = transaction.category_id || 'uncategorized';
        const categoryName = transaction.categories?.name || 'Uncategorized';
        const categoryColor = transaction.categories?.color || '#888888';
        
        if (categoryMap.has(categoryId)) {
          categoryMap.get(categoryId).amount += Number(transaction.amount);
        } else {
          categoryMap.set(categoryId, {
            categoryId,
            category: categoryName,
            color: categoryColor,
            amount: Number(transaction.amount)
          });
        }
      });
      
      return Array.from(categoryMap.values());
    },
    enabled: !!user,
  });
};

export const useYearlyFinancials = (year?: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['yearly_financials', user?.id, year],
    queryFn: async () => {
      if (!user) return [];
      
      const selectedYear = year || new Date().getFullYear();
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);
        
      if (error) {
        console.error('Error fetching yearly financials:', error);
        throw error;
      }
      
      // Process and aggregate data by month
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthDate = new Date(selectedYear, i, 1);
        return {
          month: monthDate.toLocaleString('default', { month: 'short' }),
          income: 0,
          expenses: 0,
          savings: 0
        };
      });
      
      data?.forEach(transaction => {
        const transactionDate = new Date(transaction.transaction_date);
        const monthIndex = transactionDate.getMonth();
        const amount = Number(transaction.amount);
        
        if (transaction.transaction_type === 'income') {
          monthlyData[monthIndex].income += amount;
        } else {
          monthlyData[monthIndex].expenses += amount;
        }
      });
      
      // Calculate savings for each month
      monthlyData.forEach(month => {
        month.savings = month.income - month.expenses;
      });
      
      return monthlyData;
    },
    enabled: !!user,
  });
};
