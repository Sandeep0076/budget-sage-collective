
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
import { Edit, MoreVertical, Trash2, Search, Filter, Plus, Calendar as CalendarIcon, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTransactions } from '@/hooks/useSupabaseQueries';
import { useProfile } from '@/hooks/useSupabaseQueries';
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
        <PopoverContent 
          className="w-auto p-4 bg-popover text-popover-foreground border border-border shadow-md" 
          align="start"
          sideOffset={4}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <div className="font-medium text-foreground text-sm">Start Date</div>
              <div className="border border-border rounded-md overflow-hidden">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  disabled={(date) => date > endDate || date > new Date()}
                  className="bg-background text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-foreground text-sm">End Date</div>
              <div className="border border-border rounded-md overflow-hidden">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  disabled={(date) => date < startDate || date > new Date()}
                  className="bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4 pt-3 border-t border-border">
            <Button 
              onClick={() => setShowDateFilter(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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

type SortField = 'description' | 'category' | 'date' | 'amount' | 'type' | null;
type SortDirection = 'asc' | 'desc';

const TransactionList: React.FC<TransactionListProps> = ({ onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
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
  
  // Fetch transactions with date range
  const { data: transactions = [], isLoading, refetch } = useTransactions({
    startDate: formattedStartDate,
    endDate: formattedEndDate
  });
  
  // Get user's currency preference
  const userCurrency = profile?.currency || 'EUR';
  
  // Sort and filter transactions
  // Apply date range changes and refetch data
  const handleApplyDateRange = () => {
    setShowDateFilter(false);
    refetch();
    toast({
      title: 'Date range updated',
      description: `Showing transactions from ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`
    });
  };

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) {
      console.log("No transactions data available");
      return [];
    }
    
    if (!Array.isArray(transactions)) {
      console.error("Transactions is not an array:", transactions);
      return [];
    }
    
    // First filter transactions
    let filtered = transactions.filter((transaction) => {
      if (!transaction) {
        return false;
      }
      
      const matchesSearch = 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      // Transactions are already filtered by date from the API call
      return matchesSearch;
    });

    // Then sort if a sort field is selected
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let valueA, valueB;
        
        // Extract values based on sort field
        switch(sortField) {
          case 'description':
            valueA = a.description?.toLowerCase() || '';
            valueB = b.description?.toLowerCase() || '';
            break;
          case 'category':
            valueA = a.categories?.name?.toLowerCase() || 'zzz'; // Put uncategorized at the end
            valueB = b.categories?.name?.toLowerCase() || 'zzz';
            break;
          case 'date':
            valueA = new Date(a.transaction_date).getTime();
            valueB = new Date(b.transaction_date).getTime();
            break;
          case 'amount':
            valueA = Math.abs(a.amount);
            valueB = Math.abs(b.amount);
            break;
          case 'type':
            valueA = a.transaction_type || '';
            valueB = b.transaction_type || '';
            break;
          default:
            return 0;
        }
        
        // Compare values based on sort direction
        if (valueA < valueB) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [transactions, searchTerm, sortField, sortDirection]);
  
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
        <div className="flex items-center space-x-4 mb-6 flex-wrap gap-y-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-4 bg-popover text-popover-foreground border border-border shadow-md" 
            align="start"
            sideOffset={4}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <div className="font-medium text-foreground text-sm">Start Date</div>
                <div className="border border-border rounded-md overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    disabled={(date) => date > endDate || date > new Date()}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-foreground text-sm">End Date</div>
                <div className="border border-border rounded-md overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date < startDate || date > new Date()}
                    className="bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-border">
              <Button 
                onClick={handleApplyDateRange}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Apply Range
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
                <TableHead className="cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('description')}>
                  <div className="flex items-center">
                    Description
                    {getSortIcon('description')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('category')}>
                  <div className="flex items-center">
                    Category
                    {getSortIcon('category')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('date')}>
                  <div className="flex items-center">
                    Date
                    {getSortIcon('date')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('amount')}>
                  <div className="flex items-center">
                    Amount
                    {getSortIcon('amount')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('type')}>
                  <div className="flex items-center">
                    Type
                    {getSortIcon('type')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(filteredTransactions) || filteredTransactions.length === 0 ? (
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
                  <TableRow key={transaction.id} className="transition-all duration-200 hover:bg-secondary/50">
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
              {Array.isArray(filteredTransactions) && filteredTransactions.length > 50 && (
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
