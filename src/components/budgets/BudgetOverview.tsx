
/**
 * BudgetOverview Component
 * 
 * Displays an overview of user's budget status including
 * total budget, amount spent, and a breakdown of spending
 * by category with progress indicators.
 * 
 * @param month - Current month (1-12)
 * @param year - Current year
 */

import React, { useState } from 'react';
import { useBudgets, useCategories, useMonthlySpending, useUpsertBudget } from '@/hooks/useSupabaseQueries';
import { formatCurrency, formatPercentage, calculatePercentage, getBudgetColorClass } from '@/utils/formatters';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpRight, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

interface BudgetOverviewProps {
  month: number;
  year: number;
}

// Define interfaces for our data types to help with type safety
interface CategorySpending {
  category: string;
  categoryId: string;
  color: string;
  amount: number;
}

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  };
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ month, year }) => {
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  
  // Fetch budgets, categories, and spending data
  const { data: budgets = [], isLoading: isLoadingBudgets } = useBudgets(month, year);
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: spending = [], isLoading: isLoadingSpending } = useMonthlySpending(month, year);
  const upsertBudgetMutation = useUpsertBudget();

  // Total budget and spending with proper type handling
  const totalBudget = budgets.reduce((acc: number, budget: Budget) => acc + Number(budget.amount || 0), 0);
  
  // Calculate total spent by summing all spending data with proper type casting
  const totalSpent = spending.reduce((acc: number, cat: CategorySpending) => acc + (typeof cat.amount === 'number' ? cat.amount : 0), 0);
  
  const overallPercentage = calculatePercentage(totalSpent, totalBudget);
  
  // Function to get spending for a specific category
  const getCategorySpending = (categoryId: string): number => {
    const category = spending.find((s: CategorySpending) => s.categoryId === categoryId);
    return category ? (typeof category.amount === 'number' ? category.amount : 0) : 0;
  };
  
  // Handle budget form submission
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategoryId || !budgetAmount) {
      return;
    }
    
    // Find if there's an existing budget for this category
    const existingBudget = budgets.find((b: Budget) => b.category_id === selectedCategoryId);
    
    upsertBudgetMutation.mutate({
      id: existingBudget?.id,
      category_id: selectedCategoryId,
      amount: parseFloat(budgetAmount),
      month,
      year
    }, {
      onSuccess: () => {
        setOpen(false);
        setSelectedCategoryId('');
        setBudgetAmount('');
      }
    });
  };
  
  // Loading state
  if (isLoadingBudgets || isLoadingCategories || isLoadingSpending) {
    return (
      <CustomCard className="w-full animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="h-7 w-40 bg-muted rounded"></div>
          <div className="h-9 w-28 bg-muted rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="space-y-3 text-center sm:text-left w-full">
              <div className="h-5 w-32 bg-muted rounded"></div>
              <div className="h-8 w-40 bg-muted rounded"></div>
              <div className="h-4 w-36 bg-muted rounded"></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-muted"></div>
              <div className="h-5 w-20 bg-muted rounded mt-2"></div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="h-5 w-36 bg-muted rounded mb-4"></div>
            
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-32 bg-muted rounded"></div>
                    <div className="h-5 w-24 bg-muted rounded"></div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded"></div>
                </div>
              ))}
            </div>
            
            <div className="h-9 w-full bg-muted rounded-md mt-4"></div>
          </div>
        </CardContent>
      </CustomCard>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Budget Summary Card */}
      <CustomCard className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Budget Overview</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddBudget}>
                <DialogHeader>
                  <DialogTitle>Add Budget</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={setSelectedCategoryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((cat: any) => !cat.is_income) // Only expense categories for budget
                          .map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Budget Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={upsertBudgetMutation.isPending}
                  >
                    {upsertBudgetMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              <p className="text-3xl font-bold">{formatCurrency(totalBudget)}</p>
              <div className="flex items-center text-sm">
                <Wallet className="w-4 h-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">Available: </span>
                <span className="font-medium ml-1">{formatCurrency(totalBudget - totalSpent)}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress circle with stroke-dasharray manipulation */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={overallPercentage < 0.7 ? '#10b981' : overallPercentage < 0.9 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${overallPercentage * 251.2} 251.2`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{formatPercentage(overallPercentage)}</span>
                </div>
              </div>
              <p className="text-sm font-medium mt-2">Budget Used</p>
            </div>
          </div>
          
          {/* Budget breakdown */}
          <div className="space-y-6">
            <h4 className="font-medium text-sm text-muted-foreground mb-4">Budget Breakdown</h4>
            
            {budgets.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No budgets set yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Add Budget" to set up your first budget.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget: Budget) => {
                  const spent = getCategorySpending(budget.category_id);
                  const budgetAmount = typeof budget.amount === 'number' ? budget.amount : 0;
                  const percentage = calculatePercentage(spent, budgetAmount);
                  const colorClass = getBudgetColorClass(percentage);
                  const categoryName = budget.categories?.name || 'Uncategorized';
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{categoryName}</span>
                            <span className={`text-sm font-medium ${colorClass}`}>
                              {formatCurrency(spent)} / {formatCurrency(budgetAmount)}
                            </span>
                          </div>
                          <Progress value={percentage * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/budgets">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                View Detailed Budget Report
              </Link>
            </Button>
          </div>
        </CardContent>
      </CustomCard>
    </div>
  );
};

export default BudgetOverview;
