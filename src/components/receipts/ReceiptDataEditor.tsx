
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Calendar, DollarSign, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ReceiptData } from './ReceiptScanner';

interface ReceiptDataEditorProps {
  receiptData: ReceiptData;
  onSave: (data: ReceiptData) => void;
  onCancel: () => void;
}

const ReceiptDataEditor: React.FC<ReceiptDataEditorProps> = ({
  receiptData,
  onSave,
  onCancel
}) => {
  const [data, setData] = useState<ReceiptData>(receiptData);

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    
    try {
      // Parse the date string to a Date object
      const date = new Date(dateStr);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr || '';
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle>Review Receipt Data</CardTitle>
        <CardDescription>
          Check and edit the extracted receipt details before saving
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description/Merchant</Label>
            <Input
              id="description"
              value={data.description || ''}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Merchant or transaction description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formatDate(data.date)}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={data.amount || 0}
                onChange={(e) => setData({ ...data, amount: parseFloat(e.target.value) })}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="relative">
              <Tag className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="category"
                value={data.category || ''}
                onChange={(e) => setData({ ...data, category: e.target.value })}
                className="pl-8"
                placeholder="e.g. Groceries, Dining"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={data.notes || ''}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            placeholder="Any additional information about the transaction"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(data)}>Save Transaction</Button>
      </CardFooter>
    </Card>
  );
};

export default ReceiptDataEditor;
