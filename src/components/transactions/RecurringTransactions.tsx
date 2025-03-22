
import React, { useState } from 'react';
import { 
  useRecurringTransactions, 
  useCreateRecurringTransaction, 
  useDeleteRecurringTransaction,
  RecurringFrequency
} from '@/hooks/useSupabaseQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CustomCard, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CustomCard';
import { Plus, X, Calendar, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useSupabaseQueries';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';

interface RecurringTransactionFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const frequencyOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const createRecurringTransactionMutation = useCreateRecurringTransaction();
  
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: null as string | null,
    transaction_type: 'expense' as 'expense' | 'income',
    frequency: 'monthly' as RecurringFrequency,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createRecurringTransactionMutation.mutateAsync({
        description: formData.description,
        amount: amount,
        category_id: formData.category_id,
        transaction_type: formData.transaction_type,
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        notes: formData.notes || null
      });
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        category_id: null,
        transaction_type: 'expense',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
      
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error: any) {
      console.error('Error creating recurring transaction:', error);
      toast({
        title: "Failed to create recurring transaction",
        description: error.message || "There was an error creating your recurring transaction",
        variant: "destructive"
      });
    }
  };

  if (isLoadingCategories) {
    return <div>Loading...</div>;
  }

  return (
    <CustomCard className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Set Up Recurring Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="What is this recurring transaction for?"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Amount and Frequency */}
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
                  value={formData.amount}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => handleSelectChange('frequency', value)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Frequency</SelectLabel>
                    {frequencyOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={formData.category_id || 'uncategorized'}
                onValueChange={(value) => handleSelectChange('category_id', value)}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {categories
                      .filter(cat => 
                        formData.transaction_type === 'income' 
                          ? cat.is_income 
                          : !cat.is_income
                      )
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Transaction Type</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => {
                  handleSelectChange('transaction_type', value as 'expense' | 'income');
                  // Clear category when changing type
                  setFormData(prev => ({ ...prev, category_id: null }));
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
              value={formData.notes}
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
            disabled={createRecurringTransactionMutation.isPending}
          >
            {createRecurringTransactionMutation.isPending ? 'Saving...' : 'Create Recurring Transaction'}
          </Button>
        </CardFooter>
      </form>
    </CustomCard>
  );
};

const RecurringTransactionCard = ({ transaction, onDelete, onEdit }: any) => {
  return (
    <CustomCard className="w-full mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{transaction.description}</h3>
            <div className="flex flex-col space-y-1 mt-1">
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  Starts: {new Date(transaction.start_date).toLocaleDateString()}
                  {transaction.end_date && 
                    ` • Ends: ${new Date(transaction.end_date).toLocaleDateString()}`
                  }
                </span>
              </div>
            </div>
            {transaction.categories && (
              <Badge 
                variant={transaction.transaction_type === 'income' ? 'secondary' : 'default'}
                className="mt-2"
              >
                {transaction.categories.name}
              </Badge>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-lg font-semibold ${transaction.transaction_type === 'income' ? 'text-green-400' : 'text-white'}`}>
              {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </span>
            <div className="flex space-x-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(transaction.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </CustomCard>
  );
};

const RecurringTransactions = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const { data: recurringTransactions, isLoading, refetch } = useRecurringTransactions();
  const deleteRecurringTransactionMutation = useDeleteRecurringTransaction();

  const handleAddNew = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteRecurringTransactionMutation.mutateAsync(id);
      toast({
        title: "Transaction deleted",
        description: "The recurring transaction has been deleted."
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    refetch();
    toast({
      title: editingTransaction ? "Transaction updated" : "Transaction created",
      description: editingTransaction 
        ? "The recurring transaction has been updated." 
        : "Your recurring transaction has been created."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recurring Transactions</h2>
        {!showForm ? (
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowForm(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>

      {showForm ? (
        <RecurringTransactionForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div>Loading recurring transactions...</div>
          ) : recurringTransactions && recurringTransactions.length > 0 ? (
            <div>
              {recurringTransactions.map((transaction: any) => (
                <RecurringTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              ))}
            </div>
          ) : (
            <CustomCard>
              <CardContent className="p-6 text-center">
                <RefreshCw className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No recurring transactions</h3>
                <p className="text-muted-foreground mb-4">
                  Set up recurring transactions for bills, subscriptions, or regular income.
                </p>
                <Button onClick={handleAddNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Recurring Transaction
                </Button>
              </CardContent>
            </CustomCard>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;
