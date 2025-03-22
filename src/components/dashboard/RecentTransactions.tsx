
/**
 * RecentTransactions Component
 * 
 * Displays a list of the most recent financial transactions.
 * Shows transaction type, amount, category, and date.
 * Includes a quick link to add new transactions.
 */

import React from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useTransactions, useProfile } from '@/hooks/useSupabaseQueries';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentTransactions: React.FC = () => {
  const { data: transactions = [], isLoading } = useTransactions({ limit: 5 });
  const { data: profile } = useProfile();
  
  // Get user's currency preference
  const userCurrency = profile?.currency || 'EUR';
  
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-3 border-b border-border last:border-0 animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No transactions yet.</p>
              <p className="text-sm mt-2">Add your first transaction to see it here.</p>
              <Link to="/transactions" className="mt-4 inline-block">
                <Button variant="outline" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {transactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0 transition-all duration-200 hover:bg-secondary/50 rounded-lg px-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.transaction_type === 'income' 
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {transaction.transaction_type === 'income' ? (
                        <Plus className="w-5 h-5" />
                      ) : (
                        <ArrowRight className="w-5 h-5 transform rotate-45" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.categories?.name || 'Uncategorized'} · {formatDate(transaction.transaction_date, 'short')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right font-medium ${
                    transaction.transaction_type === 'income' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : ''
                  }`}>
                    {transaction.transaction_type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount, userCurrency)}
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
            </>
          )}
        </div>
      </CardContent>
    </CustomCard>
  );
};

export default RecentTransactions;
