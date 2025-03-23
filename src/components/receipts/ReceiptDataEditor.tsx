
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Calendar, DollarSign, Tag } from 'lucide-react';
import { ReceiptData } from '@/services/ai/types';
import { format } from 'date-fns';

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

  const updateItemField = (index: number, field: string, value: any) => {
    const updatedItems = [...data.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setData({ ...data, items: updatedItems });
  };

  const removeItem = (index: number) => {
    const updatedItems = [...data.items];
    updatedItems.splice(index, 1);
    setData({ ...data, items: updatedItems });
  };

  const addItem = () => {
    const updatedItems = [...data.items, { name: "", price: 0, quantity: 1 }];
    setData({ ...data, items: updatedItems });
  };

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
            <Label htmlFor="merchant">Merchant</Label>
            <Input
              id="merchant"
              value={data.merchant || ''}
              onChange={(e) => setData({ ...data, merchant: e.target.value })}
              placeholder="Merchant name"
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
            <Label htmlFor="total">Total Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="total"
                type="number"
                step="0.01"
                value={data.total || 0}
                onChange={(e) => setData({ ...data, total: parseFloat(e.target.value) })}
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Items</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addItem}
              className="h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Item
            </Button>
          </div>
          
          {data.items && data.items.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-end">
              <div>
                <Label htmlFor={`item-name-${index}`} className="text-xs">Name</Label>
                <Input
                  id={`item-name-${index}`}
                  value={item.name || ''}
                  onChange={(e) => updateItemField(index, 'name', e.target.value)}
                  placeholder="Item name"
                />
              </div>
              <div>
                <Label htmlFor={`item-price-${index}`} className="text-xs">Price</Label>
                <Input
                  id={`item-price-${index}`}
                  type="number"
                  step="0.01"
                  value={item.price || 0}
                  onChange={(e) => updateItemField(index, 'price', parseFloat(e.target.value))}
                  className="w-24"
                />
              </div>
              <div>
                <Label htmlFor={`item-qty-${index}`} className="text-xs">Qty</Label>
                <Input
                  id={`item-qty-${index}`}
                  type="number"
                  value={item.quantity || 1}
                  onChange={(e) => updateItemField(index, 'quantity', parseInt(e.target.value, 10))}
                  className="w-16"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="h-10 w-10 mb-0.5 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
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
