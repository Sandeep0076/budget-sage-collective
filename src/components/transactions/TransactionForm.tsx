
/**
 * TransactionForm Component
 * 
 * Form for adding or editing financial transactions.
 * Collects transaction details like description, amount,
 * category, date, and type (income or expense).
 * 
 * @param onSubmit - Callback function when form is submitted
 * @param onCancel - Callback function when form is cancelled
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CustomCard, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CustomCard';
import { useCategories, useCreateTransaction } from '@/hooks/useSupabaseQueries';
import { toast } from '@/hooks/use-toast';

interface TransactionFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useCategories();
  const createTransactionMutation = useCreateTransaction();
  const [formError, setFormError] = useState<string | null>(null);
  
  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  useEffect(() => {
    // Log for debugging
    console.log('TransactionForm mounted');
    console.log('Categories loading:', isLoadingCategories);
    console.log('Categories error:', categoriesError);
    console.log('Categories data:', categories);
    
    if (categoriesError) {
      setFormError('Error loading categories. Please try again later.');
      console.error('Categories error:', categoriesError);
    }
  }, [categories, isLoadingCategories, categoriesError]);
  
  const [transactionData, setTransactionData] = useState({
    description: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: null,
    transaction_type: 'expense',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // For category_id, handle special values
    if (name === 'category_id') {
      if (value === 'uncategorized' || value === 'no-categories') {
        // Set to null or empty string based on your backend expectations
        setTransactionData(prev => ({ ...prev, [name]: null }));
      } else {
        setTransactionData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      // For other fields, just set the value directly
      setTransactionData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate amount is a valid number
    const amount = parseFloat(transactionData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Submitting transaction:', transactionData);
    
    try {
      await createTransactionMutation.mutateAsync({
        description: transactionData.description,
        amount: amount,
        transaction_date: transactionData.transaction_date,
        category_id: transactionData.category_id || null,
        transaction_type: transactionData.transaction_type as 'income' | 'expense',
        notes: transactionData.notes || null
      });
      
      // Reset form
      setTransactionData({
        description: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        category_id: null,
        transaction_type: 'expense',
        notes: ''
      });
      
      // Call onSubmit if provided
      if (onSubmit) {
        onSubmit(transactionData);
      }
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      setFormError(error.message || 'There was an error creating your transaction');
      toast({
        title: "Transaction failed",
        description: error.message || "There was an error creating your transaction",
        variant: "destructive"
      });
    }
  };

  // If there's a critical error, show error state
  if (formError) {
    return (
      <CustomCard className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-red-500 mb-4">{formError}</p>
            <Button onClick={() => setFormError(null)} variant="outline">Try Again</Button>
            {onCancel && (
              <Button onClick={onCancel} variant="ghost" className="ml-2">Cancel</Button>
            )}
          </div>
        </CardContent>
      </CustomCard>
    );
  }
  
  // Show loading state while categories are loading
  if (isLoadingCategories) {
    return (
      <CustomCard className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="mb-4">Loading transaction form...</p>
          </div>
        </CardContent>
      </CustomCard>
    );
  }

  return (
    <CustomCard className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="What was this transaction for?"
              value={transactionData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Amount and Date (side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={transactionData.amount}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Date</Label>
              <Input
                id="transaction_date"
                name="transaction_date"
                type="date"
                value={transactionData.transaction_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Category and Type (side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={transactionData.category_id || 'uncategorized'}
                onValueChange={(value) => handleSelectChange('category_id', value)}
                disabled={isLoadingCategories}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {Array.isArray(categories) && categories.length > 0 ? 
                      categories
                        .filter((cat: any) => 
                          cat && typeof cat === 'object' && 
                          (transactionData.transaction_type === 'income' 
                            ? cat.is_income 
                            : !cat.is_income)
                        )
                        .map((category: any) => (
                          <SelectItem key={category.id || 'unknown'} value={category.id || ''}>
                            {category.name || 'Unnamed Category'}
                          </SelectItem>
                        ))
                      : 
                      <SelectItem value="no-categories">No categories available</SelectItem>
                    }
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Transaction Type</Label>
              <Select
                value={transactionData.transaction_type}
                onValueChange={(value) => {
                  handleSelectChange('transaction_type', value);
                  // Clear category when changing type
                  setTransactionData(prev => ({ ...prev, category_id: '' }));
                }}
              >
                <SelectTrigger id="transaction_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Transaction Type</SelectLabel>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional details..."
              value={transactionData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={createTransactionMutation.isPending || !transactionData.description || !transactionData.amount}
          >
            {createTransactionMutation.isPending ? 'Saving...' : 'Add Transaction'}
          </Button>
        </CardFooter>
      </form>
    </CustomCard>
  );
};

export default TransactionForm;
