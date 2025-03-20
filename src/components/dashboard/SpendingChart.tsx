
/**
 * SpendingChart Component
 * 
 * Displays a chart visualizing spending and income over time.
 * Supports different chart types including area, bar, and line.
 * 
 * @param {string} chartType - Type of chart to display (area, bar, line)
 * @param {Array} data - Data for the chart
 * @param {boolean} isLoading - Loading state indicator
 */

import React, { useState } from 'react';
import { AreaChart, BarChart, LineChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CustomCard, { CardHeader, CardTitle, CardContent } from '@/components/ui/CustomCard';
import { formatCurrency } from '@/utils/formatters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SpendingChartProps {
  chartType?: 'area' | 'bar' | 'line';
  data?: any[];
  isLoading?: boolean;
}

/**
 * SpendingChart Component
 * 
 * Displays a chart visualizing spending and income over time.
 * Supports different chart types including area, bar, and line.
 */
const SpendingChart: React.FC<SpendingChartProps> = ({ 
  chartType = 'area',
  data = [],
  isLoading = false
}) => {
  const [selectedChartType, setSelectedChartType] = useState<'area' | 'bar' | 'line'>(chartType);
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mt-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm">{entry.name}: {formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };
    
    const lineProps = {
      type: "monotone" as const,
      strokeWidth: 2,
      dot: { strokeWidth: 2 },
      activeDot: { r: 6, strokeWidth: 0 },
    };
    
    switch (selectedChartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(142, 142, 160, 0.1)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(142, 142, 160, 0.1)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line dataKey="income" name="Income" stroke="#10b981" {...lineProps} />
            <Line dataKey="expenses" name="Expenses" stroke="#ef4444" {...lineProps} />
          </LineChart>
        );
      
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(142, 142, 160, 0.1)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(value) => `$${value}`} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
          </AreaChart>
        );
    }
  };
  
  return (
    <CustomCard className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Income vs Expenses</CardTitle>
        <div className="w-[140px]">
          <Select value={selectedChartType} onValueChange={(value: any) => setSelectedChartType(value)}>
            <SelectTrigger id="chart-type" className="h-8">
              <SelectValue placeholder="Select chart" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 w-full flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <p>No financial data available.</p>
              <p className="text-sm mt-2">Add transactions to see your financial trends.</p>
            </div>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </CustomCard>
  );
};

export default SpendingChart;
