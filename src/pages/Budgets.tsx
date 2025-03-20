
/**
 * Budgets Page
 * 
 * Displays budget information, including current budget status,
 * spending allocation by category, and progress toward budget goals.
 */

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import BudgetOverview from '@/components/budgets/BudgetOverview';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { formatCurrency } from '@/utils/formatters';
import { categorySpending } from '@/utils/demoData';

const Budgets = () => {
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
            June 1 - June 30, 2023
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BudgetOverview />
          </div>

          <div className="lg:col-span-1">
            <CustomCard className="w-full h-full">
              <CardHeader>
                <CardTitle>Spending Allocation</CardTitle>
              </CardHeader>
              <CardContent>
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
                        {categorySpending.map((entry, index) => (
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
                <div className="pt-4 border-t mt-4">
                  <h4 className="font-medium mb-2">Top Categories</h4>
                  <div className="space-y-2">
                    {categorySpending
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 3)
                      .map((category, index) => (
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
                    }
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
