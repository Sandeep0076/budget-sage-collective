
import React from 'react';
import { budgets, categories } from '@/utils/demoData';
import { formatCurrency, formatPercentage, calculatePercentage, getBudgetColorClass } from '@/utils/formatters';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpRight, Wallet } from 'lucide-react';

const BudgetOverview: React.FC = () => {
  // Total budget and spending
  const totalBudget = budgets.reduce((acc, budget) => acc + budget.amount, 0);
  const totalSpent = budgets.reduce((acc, budget) => acc + budget.spent, 0);
  const overallPercentage = calculatePercentage(totalSpent, totalBudget);
  
  // Function to get category name by id
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };
  
  return (
    <div className="space-y-6">
      {/* Budget Summary Card */}
      <CustomCard className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Budget Overview</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
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
            
            <div className="space-y-4">
              {budgets.map(budget => {
                const percentage = calculatePercentage(budget.spent, budget.amount);
                const colorClass = getBudgetColorClass(percentage);
                
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{getCategoryName(budget.categoryId)}</span>
                          <span className={`text-sm font-medium ${colorClass}`}>
                            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <Progress value={percentage * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              View Detailed Budget Report
            </Button>
          </div>
        </CardContent>
      </CustomCard>
    </div>
  );
};

export default BudgetOverview;
