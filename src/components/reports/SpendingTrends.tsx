
/**
 * SpendingTrends Component
 * 
 * Displays a line chart showing income and expenses trends over the months
 * of a specific year, helping users visualize their financial patterns.
 */

import React from 'react';
import { useYearlyFinancials } from '@/hooks/useSupabaseQueries';
import { formatCurrency } from '@/utils/formatters';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface SpendingTrendsProps {
  year: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

const SpendingTrends: React.FC<SpendingTrendsProps> = ({ year }) => {
  // Fetch financial data for the year
  const { data: yearlyData = [], isLoading } = useYearlyFinancials(year);
  
  // Sort months chronologically
  const monthOrder = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const sortedData = [...yearlyData].sort((a, b) => {
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });
  
  // Calculate totals for the year
  const yearTotals = sortedData.reduce(
    (acc, month) => {
      return {
        income: acc.income + month.income,
        expenses: acc.expenses + month.expenses,
      };
    },
    { income: 0, expenses: 0 }
  );
  
  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-sm text-primary">Income: {formatCurrency(payload[0].value)}</p>
          <p className="text-sm text-destructive">Expenses: {formatCurrency(payload[1].value)}</p>
          <p className="text-sm font-medium mt-1">
            Balance: {formatCurrency(payload[0].value - payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <CustomCard className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </CustomCard>
    );
  }
  
  return (
    <CustomCard className="w-full">
      <CardHeader>
        <CardTitle>Spending Trends - {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-border">
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(yearTotals.income)}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-border">
            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(yearTotals.expenses)}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-border">
            <p className="text-sm font-medium text-muted-foreground">Net Savings</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(yearTotals.income - yearTotals.expenses)}
            </p>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sortedData}
              margin={{
                top: 10,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={customTooltip} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#f43f5e" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </CustomCard>
  );
};

export default SpendingTrends;
