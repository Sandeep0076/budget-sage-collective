
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Bill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  recurring: boolean;
  frequency?: string;
  category_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
}

/**
 * Fetches bills for the current user
 */
export const useBills = (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}) => {
  return useQuery({
    queryKey: ['bills', filters],
    queryFn: async () => {
      let query = supabase
        .from('bills')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .order('due_date', { ascending: true });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.startDate) {
        query = query.gte('due_date', filters.startDate);
      }
      
      if (filters?.endDate) {
        query = query.lte('due_date', filters.endDate);
      }
      
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Bill[];
    },
  });
};

/**
 * Creates a new bill
 */
export const useCreateBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bill: Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase
        .from('bills')
        .insert([
          {
            ...bill,
            user_id: user.user.id,
          },
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data as Bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      
      toast({
        title: 'Bill created',
        description: 'Your bill has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Bill creation error:', error);
      toast({
        title: 'Error creating bill',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Updates an existing bill
 */
export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bill: Partial<Bill> & { id: string }) => {
      const { data, error } = await supabase
        .from('bills')
        .update(bill)
        .eq('id', bill.id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data as Bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      
      toast({
        title: 'Bill updated',
        description: 'Your bill has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Bill update error:', error);
      toast({
        title: 'Error updating bill',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Deletes a bill
 */
export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      
      toast({
        title: 'Bill deleted',
        description: 'Your bill has been deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Bill deletion error:', error);
      toast({
        title: 'Error deleting bill',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Marks a bill as paid
 */
export const useMarkBillPaid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('bills')
        .update({ status: 'paid' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return data as Bill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      
      toast({
        title: 'Bill marked as paid',
        description: 'Your bill has been marked as paid successfully.',
      });
    },
    onError: (error) => {
      console.error('Bill update error:', error);
      toast({
        title: 'Error marking bill as paid',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
