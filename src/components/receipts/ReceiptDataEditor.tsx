
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Calendar, DollarSign, Tag, ListIcon, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { ReceiptData, ReceiptItem } from '@/services/ai/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useSupabaseQueries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  
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
  
  const updateItemField = (index: number, field: keyof ReceiptItem, value: any) => {
    const updatedItems = [...data.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'price' || field === 'quantity' ? Number(value) : value
    };
    
    setData({
      ...data,
      items: updatedItems
    });
  };
  
  return (
    <Card className="w-full animate-fade-in gradient-bg">
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
              placeholder="Merchant or store name"
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
              <Select 
                value={data.category || ''} 
                onValueChange={(value) => setData({ ...data, category: value })}
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select a category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-medium flex items-center">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Receipt Items
            </Label>
            <Badge variant="outline" className="ml-2">
              {(data.items || []).length} items
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 w-full pr-4 pb-2 border-b mb-2 text-sm text-muted-foreground">
            <span>Item Name</span>
            <span className="text-center">Category</span>
            <span className="text-right">Price</span>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {(data.items || []).map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="grid grid-cols-3 w-full items-center pr-4">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-medium text-center">{item.category || 'General'}</span>
                    <span className="font-mono text-right">{item.price.toFixed(2)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                      <Input
                        id={`item-name-${index}`}
                        value={item.name}
                        onChange={(e) => updateItemField(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-price-${index}`}>Price</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItemField(index, 'price', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`item-quantity-${index}`}
                        type="number"
                        step="1"
                        value={item.quantity || 1}
                        onChange={(e) => updateItemField(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-category-${index}`}>Category</Label>
                      <Select
                        value={item.category || data.category || ''}
                        onValueChange={(value) => updateItemField(index, 'category', value)}
                        disabled={isLoadingCategories}
                      >
                        <SelectTrigger id={`item-category-${index}`}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(data)}>Save Transactions</Button>
      </CardFooter>
    </Card>
  );
};

export default ReceiptDataEditor;
