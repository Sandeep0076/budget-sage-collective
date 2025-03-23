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
}

// Interface for Bills
interface Bill {
  id: string;
  created_at?: string;
  user_id: string;
  bill_name: string;
  due_date: string;
  amount: number;
  recurring: boolean;
}

// Interface for Budgets
interface Budget {
  id: string;
  created_at?: string;
  user_id: string;
  category: string;
  budget_amount: number;
  start_date: string;
  end_date: string;
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

export const useTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchTransactions = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return data;
  };

  const addTransaction = useMutation({
    mutationFn: async (transactionData: {
      description: string;
      amount: number;
      transaction_type: string;
      transaction_date?: string;
      notes?: string;
    }) => {
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
    },
    onError: (error: PostgrestError) => {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction', {
        description: error.message,
      });
    },
  });

  return {
    useTransactionsQuery: () => useQuery({
      queryKey: ['transactions', user?.id],
      queryFn: fetchTransactions,
      enabled: !!user,
    }),
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};

export const useBills = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchBills = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }

    return data;
  };

  const addBill = useMutation({
    mutationFn: async (billData: {
      bill_name: string;
      due_date: string;
      amount: number;
      recurring: boolean;
    }) => {
      if (!user) throw new Error('User must be logged in to add a bill');

      const { data, error } = await supabase
        .from('bills')
        .insert({
          ...billData,
          user_id: user.id,
        })
        .select();

      if (error) {
        console.error('Error adding bill:', error);
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
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
    },
    onError: (error: PostgrestError) => {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill', {
        description: error.message,
      });
    },
  });

  return {
    useBillsQuery: () => useQuery({
      queryKey: ['bills', user?.id],
      queryFn: fetchBills,
      enabled: !!user,
    }),
    addBill,
    updateBill,
    deleteBill,
  };
};

export const useBudgets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchBudgets = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }

    return data;
  };

  const addBudget = useMutation({
    mutationFn: async (budgetData: {
      category: string;
      budget_amount: number;
      start_date: string;
      end_date: string;
    }) => {
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
    },
    onError: (error: PostgrestError) => {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget', {
        description: error.message,
      });
    },
  });

  return {
    useBudgetsQuery: () => useQuery({
      queryKey: ['budgets', user?.id],
      queryFn: fetchBudgets,
      enabled: !!user,
    }),
    addBudget,
    updateBudget,
    deleteBudget,
  };
};

export const useAIConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchAIConfig = async () => {
    if (!user) return null;

    // Use the RPC function to get the AI config
    const { data, error } = await supabase.rpc('get_ai_config_for_user', {
      user_id_param: user.id,
    });

    if (error) {
      console.error('Error fetching AI config:', error);
      throw error;
    }

    return data;
  };

  return useQuery({
    queryKey: ['ai_config', user?.id],
    queryFn: fetchAIConfig,
    enabled: !!user,
  });
};

export const useSaveAIConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const saveConfig = async (config: {
    provider: string;
    api_key: string;
    model_name: string;
    id?: string;
  }) => {
    if (!user) throw new Error('User must be logged in to save AI config');

    let result;

    if (config.id) {
      // Update existing config
      const { data, error } = await supabase.rpc('update_ai_config', {
        config_id: config.id,
        new_provider: config.provider,
        new_api_key: config.api_key,
        new_model_name: config.model_name,
      });

      if (error) throw error;
      result = data;
    } else {
      // Insert new config
      const { data, error } = await supabase.rpc('insert_ai_config', {
        for_user_id: user.id,
        new_provider: config.provider,
        new_api_key: config.api_key,
        new_model_name: config.model_name,
      });

      if (error) throw error;
      result = data;
    }

    return result;
  };

  return useMutation({
    mutationFn: saveConfig,
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
