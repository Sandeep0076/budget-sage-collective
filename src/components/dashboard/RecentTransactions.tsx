
/**
 * RecentTransactions Component
 * 
 * Displays a list of the most recent financial transactions.
 * Shows transaction type, amount, category, and date.
 * Includes a quick link to add new transactions.
 */

import React from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { transactions, categories } from '@/utils/demoData';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentTransactions: React.FC = () => {
  const recentTransactions = transactions.slice(0, 5);
  
  // Function to get category name by id
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  return (
    <CustomCard className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Link to="/transactions">
          <Button variant="ghost" size="sm" className="text-sm">
            View All
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map(transaction => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0 transition-all duration-200 hover:bg-secondary/50 rounded-lg px-2"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' 
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? (
                    <Plus className="w-5 h-5" />
                  ) : (
                    <ArrowRight className="w-5 h-5 transform rotate-45" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-medium leading-none">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {getCategoryName(transaction.categoryId)} · {formatDate(transaction.date, 'short')}
                  </p>
                </div>
              </div>
              <div className={`text-right font-medium ${
                transaction.type === 'income' 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : ''
              }`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
          
          {/* Add Transaction Button */}
          <div className="pt-2">
            <Link to="/transactions">
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </CustomCard>
  );
};

export default RecentTransactions;
