
/**
 * Dashboard Component
 * 
 * Main dashboard view that displays financial summary cards,
 * spending charts, category breakdown, and recent transactions.
 * Acts as the central hub for the application.
 */

import React, { useState } from 'react';
import SummaryCards from './SummaryCards';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { formatCurrency } from '@/utils/formatters';
import { useYearlyFinancials, useMonthlySpending } from '@/hooks/useSupabaseQueries';

const Dashboard: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear] = useState(currentYear);
  const [selectedMonth] = useState(currentMonth);
  
  // Fetch yearly financial data for the chart
  const { data: yearlyData = [], isLoading: isLoadingYearlyData } = useYearlyFinancials(selectedYear);
  
  // Fetch monthly spending by category
  const { data: categorySpending = [], isLoading: isLoadingCategoryData } = useMonthlySpending(selectedMonth, selectedYear);

  // Calculate summary metrics
  const currentMonthData = yearlyData.find(
    (item) => item.month === new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'short' })
  );
  
  const income = currentMonthData?.income || 0;
  const expenses = currentMonthData?.expenses || 0;
  const balance = income - expenses;
  
  // Get total budget (this could be improved by fetching actual budget data)
  const budget = expenses * 1.2; // Just an example calculation

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

  // Render custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="grid grid-cols-2 gap-2 text-xs">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="truncate">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Summary Cards */}
      <SummaryCards 
        income={income} 
        expenses={expenses} 
        balance={balance} 
        budget={budget} 
        isLoading={isLoadingYearlyData}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Spending Chart */}
        <div className="lg:col-span-2">
          <SpendingChart 
            chartType="area" 
            data={yearlyData} 
            isLoading={isLoadingYearlyData} 
          />
        </div>
        
        {/* Category Chart */}
        <div className="lg:col-span-1">
          <CustomCard className="w-full h-full">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCategoryData ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : categorySpending.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-center">
                  <div className="text-muted-foreground">
                    <p>No spending data available for this month.</p>
                    <p className="text-sm mt-2">Add transactions to see your spending breakdown.</p>
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
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="category"
                        animationDuration={1000}
                        animationBegin={200}
                      >
                        {categorySpending.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke="transparent" 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={customTooltip} />
                      <Legend content={renderLegend} layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </CustomCard>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
};

export default Dashboard;
