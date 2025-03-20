
/**
 * Dashboard Component
 * 
 * Main dashboard view that displays financial summary cards,
 * spending charts, category breakdown, and recent transactions.
 * Acts as the central hub for the application.
 */

import React from 'react';
import SummaryCards from './SummaryCards';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { categorySpending } from '@/utils/demoData';
import { formatCurrency } from '@/utils/formatters';

const Dashboard: React.FC = () => {
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
        income={3450.00} 
        expenses={2135.75} 
        balance={1314.25} 
        budget={2500.00} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Spending Chart */}
        <div className="lg:col-span-2">
          <SpendingChart chartType="area" />
        </div>
        
        {/* Category Chart */}
        <div className="lg:col-span-1">
          <CustomCard className="w-full h-full">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
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
                      {categorySpending.map((entry, index) => (
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
