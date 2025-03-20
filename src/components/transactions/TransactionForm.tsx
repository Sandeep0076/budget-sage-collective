
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
import { categories } from '@/utils/demoData';
import CustomCard, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CustomCard';

interface TransactionFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [transactionData, setTransactionData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    type: 'expense',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTransactionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        ...transactionData,
        amount: parseFloat(transactionData.amount),
        id: Date.now().toString()
      });
    }
    // Reset form
    setTransactionData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      type: 'expense',
      notes: ''
    });
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
                  placeholder="0.00"
                  value={transactionData.amount}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={transactionData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Category and Type (side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={transactionData.categoryId}
                onValueChange={(value) => handleSelectChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={transactionData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
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
          <Button type="submit">Add Transaction</Button>
        </CardFooter>
      </form>
    </CustomCard>
  );
};

export default TransactionForm;
