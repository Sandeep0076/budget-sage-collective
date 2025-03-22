
/**
 * TransactionList Component
 * 
 * Displays a filterable and searchable list of financial transactions.
 * Includes sorting, filtering, and pagination capabilities.
 * Also provides options to edit or delete transactions.
 * Supports date range selection and shows current month transactions by default.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit, MoreVertical, Trash2, Search, Filter, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useTransactions, useProfile } from '@/hooks/useSupabaseQueries';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

// Date range selector component
interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  showDateFilter,
  setShowDateFilter
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex space-x-2 p-3">
            <div className="space-y-2">
              <div className="font-medium">Start Date</div>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                disabled={(date) => date > endDate || date > new Date()}
              />
            </div>
            <div className="space-y-2">
              <div className="font-medium">End Date</div>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                disabled={(date) => date < startDate || date > new Date()}
              />
            </div>
          </div>
          <div className="flex justify-end p-3 border-t">
            <Button 
              size="sm" 
              onClick={() => setShowDateFilter(false)}
            >
              Apply Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface TransactionListProps {
  onAddNew?: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  
  // Get current month date range
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
  );
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  // Format dates for API
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  // Fetch transactions with date range filter
  const { data: transactions = [], isLoading } = useTransactions({
    startDate: formattedStartDate,
    endDate: formattedEndDate
  });
  
  // Get user's currency preference
  const userCurrency = profile?.currency || 'EUR';
  
  // Filter transactions based on search term - memoize to prevent unnecessary recalculations
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction: any) => 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);
  
  // Function to delete a transaction
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Invalidate all related queries to ensure dashboard and other components update correctly
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthlySpending'] });
      queryClient.invalidateQueries({ queryKey: ['yearlyFinancials'] });
      
      toast({
        title: 'Transaction deleted',
        description: 'The transaction has been deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting transaction',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Status badge component
  const getStatusBadge = (type: string) => {
    if (type === 'income') {
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Income</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Expense</Badge>;
  };
  
    // Prepare props for DateRangeSelector component
  const dateRangeSelectorProps = {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    showDateFilter,
    setShowDateFilter
  };
  
  // Loading skeleton with reduced animations to prevent flickering
  if (isLoading) {
    return (
      <CustomCard className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative w-64 h-9 bg-muted rounded-md"></div>
            <div className="w-9 h-9 bg-muted rounded-md"></div>
            <div className="w-24 h-9 bg-muted rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="h-4 w-24 bg-muted rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-muted rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 bg-muted rounded"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 w-8 bg-muted rounded-full float-right"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </CustomCard>
    );
  }
  
  return (
    <CustomCard className="w-full">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Transactions</CardTitle>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search transactions..."
              className="pl-8 w-full md:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DateRangeSelector 
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            showDateFilter={showDateFilter}
            setShowDateFilter={setShowDateFilter}
          />
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm 
                      ? 'No transactions found. Try different search terms.' 
                      : 'No transactions found for the selected date range.'}
                  </TableCell>
                </TableRow>
              ) : (
                // Only render a reasonable number of transactions to prevent performance issues
                filteredTransactions.slice(0, 50).map((transaction: any) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.categories?.name || 'Uncategorized'}</TableCell>
                    <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                    <TableCell className={transaction.transaction_type === 'income' ? 'text-emerald-600' : ''}>
                      {transaction.transaction_type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount, userCurrency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.transaction_type)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-600"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {filteredTransactions.length > 50 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Showing 50 of {filteredTransactions.length} transactions. Please use search or date filters to narrow results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </CustomCard>
  );
};

export default TransactionList;
