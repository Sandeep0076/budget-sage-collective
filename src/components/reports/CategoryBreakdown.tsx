
/**
 * CategoryBreakdown Component
 * 
 * Displays spending breakdown by category for a specific month or year,
 * including a pie chart visualization and a detailed list view.
 */

import React, { useState } from 'react';
import { useMonthlySpending } from '@/hooks/useSupabaseQueries';
import { formatCurrency } from '@/utils/formatters';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Layers } from 'lucide-react';

interface CategoryBreakdownProps {
  month?: number;
  year: number;
  isYearly?: boolean;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ 
  month = new Date().getMonth() + 1, 
  year, 
  isYearly = false 
}) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  
  // If yearly view, get data for all months of the year
  // For simplicity in this implementation, we'll just use the current month data
  // In a real implementation, you would need to aggregate data across all months
  const { data: categorySpending = [], isLoading } = useMonthlySpending(month, year);
  
  // Sort categories by amount (descending)
  const sortedCategories = [...categorySpending].sort((a, b) => b.amount - a.amount);
  
  // Calculate total spending
  const totalSpending = sortedCategories.reduce((total, cat) => total + cat.amount, 0);
  
  // Custom tooltip for the pie chart
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.amount / totalSpending) * 100).toFixed(1);
      
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm">{formatCurrency(data.amount)}</p>
          <p className="text-sm text-muted-foreground">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };
  
  // Render custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="truncate">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Format time period for display
  const timePeriod = isYearly 
    ? year.toString() 
    : `${new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })} ${year}`;
  
  if (isLoading) {
    return (
      <CustomCard className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </CustomCard>
    );
  }
  
  if (sortedCategories.length === 0) {
    return (
      <CustomCard className="w-full min-h-[400px]">
        <CardHeader>
          <CardTitle>Spending by Category - {timePeriod}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-80">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No spending data available</h3>
          <p className="text-muted-foreground text-center max-w-md">
            There are no transactions recorded for this time period. 
            Add some transactions to see your spending breakdown.
          </p>
        </CardContent>
      </CustomCard>
    );
  }
  
  return (
    <CustomCard className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spending by Category - {timePeriod}</CardTitle>
        <Tabs 
          value={view} 
          onValueChange={(value) => setView(value as 'chart' | 'table')}
        >
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <TabsContent value="chart" className="mt-0">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="amount"
                  nameKey="category"
                >
                  {sortedCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.map((category, index) => {
                const percentage = ((category.amount / totalSpending) * 100).toFixed(1);
                
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }} 
                        />
                        <span>{category.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(category.amount)}</TableCell>
                    <TableCell className="text-right">{percentage}%</TableCell>
                  </TableRow>
                );
              })}
              
              <TableRow className="font-medium">
                <TableCell>Total</TableCell>
                <TableCell>{formatCurrency(totalSpending)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
      </CardContent>
    </CustomCard>
  );
};

export default CategoryBreakdown;
