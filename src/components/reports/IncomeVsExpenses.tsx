
/**
 * IncomeVsExpenses Component
 * 
 * Displays a comparison between income and expenses for a specific month,
 * including total amounts and a visualization.
 */

import React from 'react';
import { useYearlyFinancials } from '@/hooks/useSupabaseQueries';
import { formatCurrency } from '@/utils/formatters';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface IncomeVsExpensesProps {
  month: number;
  year: number;
}

const IncomeVsExpenses: React.FC<IncomeVsExpensesProps> = ({ month, year }) => {
  // Fetch financial data for the year
  const { data: yearlyData = [], isLoading } = useYearlyFinancials(year);
  
  // Get data for the selected month
  const monthData = yearlyData.find(item => {
    const itemMonth = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short' });
    return item.month === itemMonth;
  });
  
  const income = monthData?.income || 0;
  const expenses = monthData?.expenses || 0;
  const balance = income - expenses;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  
  // Format month name for display
  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
  
  // Chart data
  const chartData = [
    {
      name: 'Income',
      amount: income,
      fill: '#10b981', // Green
    },
    {
      name: 'Expenses',
      amount: expenses,
      fill: '#f43f5e', // Red
    },
    {
      name: 'Balance',
      amount: balance,
      fill: '#0ea5e9', // Blue
    },
  ];
  
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
        <CardTitle>Income vs Expenses - {monthName} {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center p-4 rounded-lg bg-primary/5 border border-border">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mr-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Income</p>
              <p className="text-2xl font-bold">{formatCurrency(income)}</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 rounded-lg bg-destructive/5 border border-border">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-destructive/10 mr-4">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold">{formatCurrency(expenses)}</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 rounded-lg bg-secondary/5 border border-border">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-secondary/10 mr-4">
              <DollarSign className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
              <p className="text-2xl font-bold">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${formatCurrency(value as number)}`, 'Amount']}
              />
              <Legend />
              <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </CustomCard>
  );
};

export default IncomeVsExpenses;
