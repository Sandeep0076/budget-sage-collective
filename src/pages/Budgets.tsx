
/**
 * Budgets Page
 * 
 * Displays budget information, including current budget status,
 * spending allocation by category, and progress toward budget goals.
 * Allows users to set and manage their budget limits.
 */

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import BudgetOverview from '@/components/budgets/BudgetOverview';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { formatCurrency } from '@/utils/formatters';
import { useMonthlySpending } from '@/hooks/useSupabaseQueries';

const Budgets = () => {
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
  const currentYear = currentDate.getFullYear();
  
  const [selectedMonth] = useState(currentMonth);
  const [selectedYear] = useState(currentYear);
  
  // Fetch category spending data
  const { data: categorySpending = [], isLoading: isLoadingSpending } = useMonthlySpending(selectedMonth, selectedYear);
  
  // Custom tooltip formatter for the pie chart
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium text-sm">{payload[0].name}</p>
          <p className="text-sm font-semibold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <div className="text-sm text-muted-foreground">
            {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BudgetOverview month={selectedMonth} year={selectedYear} />
          </div>

          <div className="lg:col-span-1">
            <CustomCard className="w-full h-full">
              <CardHeader>
                <CardTitle>Spending Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSpending ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : categorySpending.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-center">
                    <div className="text-muted-foreground">
                      <p>No spending data available.</p>
                      <p className="text-sm mt-2">Add transactions to see your spending allocation.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySpending}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                          nameKey="category"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                          animationDuration={1000}
                        >
                          {categorySpending.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={customTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="pt-4 border-t mt-4">
                  <h4 className="font-medium mb-2">Top Categories</h4>
                  <div className="space-y-2">
                    {isLoadingSpending ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex justify-between items-center animate-pulse">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-muted mr-2"></div>
                            <div className="h-4 w-24 bg-muted rounded"></div>
                          </div>
                          <div className="h-4 w-16 bg-muted rounded"></div>
                        </div>
                      ))
                    ) : categorySpending.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data available</p>
                    ) : (
                      categorySpending
                        .sort((a: any, b: any) => b.amount - a.amount)
                        .slice(0, 3)
                        .map((category: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-sm">{category.category}</span>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(category.amount)}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </CardContent>
            </CustomCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Budgets;
