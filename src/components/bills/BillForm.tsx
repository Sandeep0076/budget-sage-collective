
import React, { useState } from 'react';
import { useCategories } from '@/hooks/useSupabaseQueries';
import { useCreateBill, useUpdateBill } from '@/hooks/useBillsQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CustomCard, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CustomCard';
import { Switch } from '@/components/ui/switch';
import { Calendar } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface BillFormProps {
  bill?: any;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const frequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' }
];

const BillForm: React.FC<BillFormProps> = ({
  bill,
  onSubmit,
  onCancel
}) => {
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const createBillMutation = useCreateBill();
  const updateBillMutation = useUpdateBill();
  
  const [formData, setFormData] = useState({
    name: bill?.name || '',
    amount: bill?.amount ? String(bill.amount) : '',
    due_date: bill?.due_date || new Date().toISOString().split('T')[0],
    status: bill?.status || 'pending',
    recurring: bill?.recurring || false,
    frequency: bill?.frequency || 'monthly',
    category_id: bill?.category_id || '',
    notes: bill?.notes || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const billData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        status: formData.status as 'pending' | 'paid' | 'overdue',
        recurring: formData.recurring,
        frequency: formData.recurring ? formData.frequency : undefined,
        category_id: formData.category_id && formData.category_id !== '' ? formData.category_id : undefined,
        notes: formData.notes && formData.notes !== '' ? formData.notes : undefined
      };

      if (bill?.id) {
        await updateBillMutation.mutateAsync({
          id: bill.id,
          ...billData
        });
      } else {
        await createBillMutation.mutateAsync(billData);
      }
      
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error: any) {
      console.error('Error saving bill:', error);
    }
  };

  const categories = Array.isArray(categoriesData) ? categoriesData.filter(cat => !cat.is_income) : [];
  
  const isLoading = isLoadingCategories || createBillMutation.isPending || updateBillMutation.isPending;

  return (
    <CustomCard className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{bill ? 'Edit Bill' : 'Add New Bill'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bill Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Bill Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter bill name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Amount and Due Date */}
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
              <Label htmlFor="due_date">Due Date</Label>
              <div className="relative">
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Status and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <RadioGroup 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="status-pending" />
                  <Label htmlFor="status-pending" className="cursor-pointer">Pending</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="status-paid" />
                  <Label htmlFor="status-paid" className="cursor-pointer">Paid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overdue" id="status-overdue" />
                  <Label htmlFor="status-overdue" className="cursor-pointer">Overdue</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <RadioGroup 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange('category_id', value)}
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="category-none" />
                  <Label htmlFor="category-none" className="cursor-pointer">Uncategorized</Label>
                </div>
                {categories && categories.length > 0 ? (
                  categories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                      <Label htmlFor={`category-${category.id}`} className="cursor-pointer">{category.name}</Label>
                    </div>
                  ))
                ) : null}
              </RadioGroup>
            </div>
          </div>

          {/* Recurring Bill */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="recurring">Recurring Bill</Label>
              <Switch
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) => handleSwitchChange('recurring', checked)}
              />
            </div>
            {formData.recurring && (
              <div className="mt-4">
                <Label htmlFor="frequency">Frequency</Label>
                <RadioGroup 
                  value={formData.frequency} 
                  onValueChange={(value) => handleSelectChange('frequency', value)}
                  className="flex flex-col space-y-1 mt-2"
                >
                  {frequencyOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`frequency-${option.value}`} />
                      <Label htmlFor={`frequency-${option.value}`} className="cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
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
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : bill ? 'Update Bill' : 'Add Bill'}
          </Button>
        </CardFooter>
      </form>
    </CustomCard>
  );
};

export default BillForm;
