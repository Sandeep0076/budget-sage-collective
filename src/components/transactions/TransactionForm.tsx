
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

import React, { useState } from 'react';
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
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const createTransactionMutation = useCreateTransaction();
  
  const [transactionData, setTransactionData] = useState({
    description: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: '',
    transaction_type: 'expense',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTransactionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        category_id: '',
        transaction_type: 'expense',
        notes: ''
      });
      
      // Call onSubmit if provided
      if (onSubmit) {
        onSubmit(transactionData);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Transaction failed",
        description: "There was an error creating your transaction",
        variant: "destructive"
      });
    }
  };

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
                value={transactionData.category_id}
                onValueChange={(value) => handleSelectChange('category_id', value)}
                disabled={isLoadingCategories}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="">Uncategorized</SelectItem>
                    {categories
                      .filter((cat: any) => 
                        transactionData.transaction_type === 'income' 
                          ? cat.is_income 
                          : !cat.is_income
                      )
                      .map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                    ))}
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
