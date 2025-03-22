
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useCreateTransaction } from '@/hooks/useSupabaseQueries';

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
 * Calculate the next due date based on the current date and frequency
 * Preserves the day of the month for monthly, quarterly, biannually, and annual frequencies
 */
const calculateNextDueDate = (currentDueDate: string, frequency: string): string => {
  // Parse the current due date
  const date = new Date(currentDueDate);
  const originalDay = date.getDate();
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly': {
      // Move to the next month
      date.setMonth(date.getMonth() + 1);
      
      // Check if the day should be adjusted (for months with fewer days)
      const newMonth = date.getMonth();
      date.setDate(1); // Set to first day of month
      date.setMonth(newMonth); // Set the correct month
      
      // Get the last day of the new month
      const lastDay = new Date(date.getFullYear(), newMonth + 1, 0).getDate();
      
      // Set the day to either the original day or the last day of the month if original day exceeds it
      date.setDate(Math.min(originalDay, lastDay));
      break;
    }
    case 'quarterly': {
      // Move 3 months forward
      date.setMonth(date.getMonth() + 3);
      
      // Adjust for months with fewer days
      const newMonth = date.getMonth();
      date.setDate(1);
      date.setMonth(newMonth);
      
      const lastDay = new Date(date.getFullYear(), newMonth + 1, 0).getDate();
      date.setDate(Math.min(originalDay, lastDay));
      break;
    }
    case 'biannually': {
      // Move 6 months forward
      date.setMonth(date.getMonth() + 6);
      
      // Adjust for months with fewer days
      const newMonth = date.getMonth();
      date.setDate(1);
      date.setMonth(newMonth);
      
      const lastDay = new Date(date.getFullYear(), newMonth + 1, 0).getDate();
      date.setDate(Math.min(originalDay, lastDay));
      break;
    }
    case 'annually': {
      // Move 1 year forward
      date.setFullYear(date.getFullYear() + 1);
      
      // Adjust for leap years
      if (originalDay === 29 && date.getMonth() === 1) { // February
        const isLeapYear = (date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) || date.getFullYear() % 400 === 0;
        if (!isLeapYear) {
          date.setDate(28); // Set to Feb 28 in non-leap years
        }
      }
      break;
    }
    default:
      // Default to monthly
      date.setMonth(date.getMonth() + 1);
      
      // Adjust for months with fewer days
      const newMonth = date.getMonth();
      date.setDate(1);
      date.setMonth(newMonth);
      
      const lastDay = new Date(date.getFullYear(), newMonth + 1, 0).getDate();
      date.setDate(Math.min(originalDay, lastDay));
  }
  
  return date.toISOString().split('T')[0];
};

/**
 * Marks a bill as paid and creates a corresponding transaction
 * If the bill is recurring, creates the next bill
 */
export const useMarkBillPaid = () => {
  const queryClient = useQueryClient();
  const createTransactionMutation = useCreateTransaction();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First, get the bill details
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .select(`
          *,
          categories (id, name, color)
        `)
        .eq('id', id)
        .single();
      
      if (billError) {
        console.error('Error fetching bill:', billError);
        throw billError;
      }
      
      const bill = billData as Bill;
      
      // Update the bill status to paid
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
      
      // Create a transaction for this bill payment
      try {
        await createTransactionMutation.mutateAsync({
          amount: bill.amount,
          description: `Bill payment: ${bill.name}`,
          transaction_date: new Date().toISOString().split('T')[0],
          transaction_type: 'expense',
          category_id: bill.category_id || null,
          notes: `Automatic transaction created for bill payment: ${bill.name} (Bill ID: ${bill.id})`
        });
      } catch (transactionError: any) {
        console.error('Error creating transaction for bill payment:', transactionError);
        // We don't throw here to avoid failing the whole operation
        // The bill is still marked as paid even if transaction creation fails
        toast({
          title: 'Bill marked as paid, but transaction creation failed',
          description: transactionError.message,
          variant: 'destructive',
        });
      }
      
      // If this is a recurring bill, create the next one
      if (bill.recurring) {
        try {
          console.log('Creating next recurring bill for:', bill.name);
          
          // Calculate the next due date based on frequency
          const nextDueDate = calculateNextDueDate(bill.due_date, bill.frequency || 'monthly');
          console.log('Next due date calculated:', nextDueDate);
          
          // Create a new bill for the next period
          const { data: newBill, error: createError } = await supabase
            .from('bills')
            .insert([
              {
                user_id: bill.user_id,
                name: bill.name,
                amount: bill.amount,
                due_date: nextDueDate,
                status: 'pending',
                recurring: bill.recurring,
                frequency: bill.frequency,
                category_id: bill.category_id,
                notes: bill.notes
              },
            ])
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating next recurring bill:', createError);
            toast({
              title: 'Bill marked as paid, but failed to create next recurring bill',
              description: createError.message,
              variant: 'destructive',
            });
          } else {
            console.log('Successfully created next recurring bill:', newBill);
          }
        } catch (recurringError: any) {
          console.error('Error creating next recurring bill:', recurringError);
          toast({
            title: 'Bill marked as paid, but failed to create next recurring bill',
            description: recurringError.message,
            variant: 'destructive',
          });
        }
      }
      
      return data as Bill;
    },
    onSuccess: (data, variables) => {
      // Force a refetch of the bills data to ensure we see the new recurring bill
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      // Explicitly refetch with all statuses to ensure we get the new pending bill
      queryClient.fetchQuery({ queryKey: ['bills'] });
      
      toast({
        title: 'Bill marked as paid',
        description: 'Your bill has been marked as paid and a transaction has been created. If this was a recurring bill, the next bill has been scheduled.',
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
