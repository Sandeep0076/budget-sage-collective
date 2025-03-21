
/**
 * TransactionList Component
 * 
 * Displays a filterable and searchable list of financial transactions.
 * Includes sorting, filtering, and pagination capabilities.
 * Also provides options to edit or delete transactions.
 */

import React, { useState } from 'react';
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
import { Edit, MoreVertical, Trash2, Search, Filter, Plus } from 'lucide-react';
import { useTransactions } from '@/hooks/useSupabaseQueries';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface TransactionListProps {
  onAddNew?: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: transactions = [], isLoading } = useTransactions();
  const queryClient = useQueryClient();
  
  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction: any) => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Function to delete a transaction
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
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
  
  // Loading skeleton
  if (isLoading) {
    return (
      <CustomCard className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative w-64 h-9 bg-muted rounded-md animate-pulse"></div>
            <div className="w-9 h-9 bg-muted rounded-md animate-pulse"></div>
            <div className="w-24 h-9 bg-muted rounded-md animate-pulse"></div>
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
                      <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 w-8 bg-muted rounded-full float-right animate-pulse"></div>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transactions</CardTitle>
        <div className="flex items-center space-x-2">
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
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
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
                      : 'No transactions yet. Add your first transaction using the button above.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id} className="animate-fade-in hover:bg-muted/50">
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.categories?.name || 'Uncategorized'}</TableCell>
                    <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                    <TableCell className={transaction.transaction_type === 'income' ? 'text-emerald-600' : ''}>
                      {transaction.transaction_type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
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
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </CustomCard>
  );
};

export default TransactionList;
