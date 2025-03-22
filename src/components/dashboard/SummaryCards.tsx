
/**
 * SummaryCards Component
 * 
 * Displays financial summary information in a grid of cards,
 * showing income, expenses, balance, and budget progress.
 * 
 * @param {number} income - Total income amount
 * @param {number} expenses - Total expenses amount
 * @param {number} balance - Net balance (income - expenses)
 * @param {number} budget - Budget amount for comparison
 * @param {boolean} isLoading - Loading state indicator
 */

import React from 'react';
import { ArrowUp, ArrowDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency, calculatePercentage } from '@/utils/formatters';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import CustomCard, { CardContent } from '@/components/ui/CustomCard';
import { Progress } from '@/components/ui/progress';

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
  budget: number;
  isLoading?: boolean;
}

/**
 * SummaryCards Component
 * 
 * Displays financial summary information in a grid of cards,
 * showing income, expenses, balance, and budget progress.
 */
const SummaryCards: React.FC<SummaryCardsProps> = ({ 
  income, 
  expenses, 
  balance, 
  budget,
  isLoading = false
}) => {
  // Calculate budget percentage
  const budgetPercentage = calculatePercentage(expenses, budget) * 100;
  
  // Determine budget status color
  const getBudgetColor = (): string => {
    if (budgetPercentage < 70) return 'text-emerald-500';
    if (budgetPercentage < 90) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Determine budget status text
  const getBudgetStatus = (): string => {
    if (budgetPercentage < 70) return 'On track';
    if (budgetPercentage < 90) return 'Caution';
    return 'Over budget';
  };
  
  // Skeleton loading component with subtle animation
  const SkeletonCard = () => (
    <CustomCard className="animate-pulse">
      <CardContent className="p-6">
        <div className="h-5 w-24 bg-muted rounded mb-4"></div>
        <div className="h-8 w-32 bg-muted rounded mb-2"></div>
        <div className="h-4 w-20 bg-muted rounded"></div>
      </CardContent>
    </CustomCard>
  );
  
  // Only show loading state on initial load when we have no data
  // This prevents flickering when data is refreshing
  if (isLoading && (income === 0 && expenses === 0 && balance === 0)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Income Card */}
      <CustomCard>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-muted-foreground">Income</p>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <ArrowUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            <AnimatedCounter value={income} formatter={formatCurrency} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monthly income
          </p>
        </CardContent>
      </CustomCard>
      
      {/* Expenses Card */}
      <CustomCard>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-muted-foreground">Expenses</p>
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ArrowDown className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            <AnimatedCounter value={expenses} formatter={formatCurrency} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monthly expenses
          </p>
        </CardContent>
      </CustomCard>
      
      {/* Balance Card */}
      <CustomCard>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-muted-foreground">Balance</p>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <AnimatedCounter value={balance} formatter={formatCurrency} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Net for this month
          </p>
        </CardContent>
      </CustomCard>
      
      {/* Budget Card */}
      <CustomCard>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-muted-foreground">Budget</p>
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            <AnimatedCounter value={budget} formatter={formatCurrency} />
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span>Used: {formatCurrency(expenses)}</span>
              <span className={getBudgetColor()}>{getBudgetStatus()}</span>
            </div>
            <Progress value={budgetPercentage} className="h-2" />
          </div>
        </CardContent>
      </CustomCard>
    </div>
  );
};

export default SummaryCards;
