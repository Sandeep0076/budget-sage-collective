/**
 * SpendingSummaryReport Component
 * 
 * Displays a comprehensive spending summary with period selection,
 * category breakdowns, and spending trends.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/useSupabaseQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Type for transaction with categories
interface TransactionWithCategory {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  transaction_type: string;
  category_id?: string;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
}

// Date range presets
const dateRangePresets = {
  'last7Days': {
    label: 'Last 7 Days',
    from: () => subDays(new Date(), 7),
    to: () => new Date()
  },
  'thisMonth': {
    label: 'This Month',
    from: () => startOfMonth(new Date()),
    to: () => endOfMonth(new Date())
  },
  'lastMonth': {
    label: 'Last Month',
    from: () => startOfMonth(subDays(new Date(), 30)),
    to: () => endOfMonth(subDays(new Date(), 30))
  },
  'thisWeek': {
    label: 'This Week',
    from: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: () => endOfWeek(new Date(), { weekStartsOn: 1 })
  },
  'thisYear': {
    label: 'This Year',
    from: () => startOfYear(new Date()),
    to: () => endOfYear(new Date())
  }
};

const SpendingSummaryReport: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    from: dateRangePresets.thisMonth.from(),
    to: dateRangePresets.thisMonth.to()
  });
  const [datePreset, setDatePreset] = useState<string>('thisMonth');
  const [viewType, setViewType] = useState<'summary' | 'details'>('summary');
  
  // Format dates for query
  const formattedStartDate = format(dateRange.from, 'yyyy-MM-dd');
  const formattedEndDate = format(dateRange.to, 'yyyy-MM-dd');
  
  // Get transactions data
  const { data: transactions, isLoading, isError } = useTransactions({
    startDate: formattedStartDate,
    endDate: formattedEndDate
  });
  
  // Apply date preset
  const handleDatePresetChange = (value: string) => {
    setDatePreset(value);
    if (dateRangePresets[value as keyof typeof dateRangePresets]) {
      const preset = dateRangePresets[value as keyof typeof dateRangePresets];
      setDateRange({
        from: preset.from(),
        to: preset.to()
      });
    }
  };
  
  // Handle custom date range selection
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
      setDatePreset('custom');
    }
  };
  
  // Calculate spending metrics
  const metrics = useMemo(() => {
    if (!transactions || transactions.length === 0) return {
      totalSpending: 0,
      totalIncome: 0,
      netAmount: 0,
      avgDailySpending: 0,
      byCategory: {},
      topExpenseCategories: [],
      topExpenseItems: []
    };
    
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    const incomeTransactions = transactions.filter(t => t.amount > 0);
    
    const totalSpending = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0));
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate net amount (income - spending)
    const netAmount = totalIncome - totalSpending;
    
    // Calculate average daily spending
    const daysDiff = Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)));
    const avgDailySpending = totalSpending / daysDiff;
    
    // Spending by category
    const byCategory: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      // Get category name from the categories object or fallback to Uncategorized
      const category = t.categories?.name || 'Uncategorized';
      byCategory[category] = (byCategory[category] || 0) + Math.abs(t.amount);
    });
    
    // Sort categories by spending amount
    const sortedCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
    
    // Get top expense items
    const topItems = expenseTransactions
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5)
      .map(t => ({
        description: t.description || 'Unnamed transaction',
        amount: Math.abs(t.amount),
        date: format(new Date(t.transaction_date), 'MMM dd, yyyy'),
        category: t.categories?.name || 'Uncategorized'
      }));
    
    return {
      totalSpending,
      totalIncome,
      netAmount,
      avgDailySpending,
      byCategory,
      topExpenseCategories: sortedCategories,
      topExpenseItems: topItems
    };
  }, [transactions, dateRange]);
  
  // Chart data for category breakdown
  const categoryChartData = {
    labels: metrics.topExpenseCategories.map(c => c.category),
    datasets: [
      {
        label: 'Spending',
        data: metrics.topExpenseCategories.map(c => c.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD'
              }).format(context.raw);
            }
            return label;
          }
        }
      }
    },
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 border shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Spending Summary Report</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Date Range</label>
              <Select 
                value={datePreset} 
                onValueChange={handleDatePresetChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dateRangePresets).map(([key, preset]) => (
                    <SelectItem key={key} value={key}>
                      {preset.label}
                    </SelectItem>
                  ))}
                  {datePreset === 'custom' && (
                    <SelectItem value="custom">Custom Range</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Custom Range</label>
              <DatePickerWithRange 
                date={dateRange} 
                setDate={handleDateRangeChange}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Total Spending</CardDescription>
                <CardTitle className="text-2xl text-red-500">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatCurrency(metrics.totalSpending)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Total Income</CardDescription>
                <CardTitle className="text-2xl text-green-500">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatCurrency(metrics.totalIncome)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Net Balance</CardDescription>
                <CardTitle className={`text-2xl ${metrics.netAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatCurrency(metrics.netAmount)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Avg. Daily Spending</CardDescription>
                <CardTitle className="text-2xl">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    formatCurrency(metrics.avgDailySpending)
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
        
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'summary' | 'details')}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>Spending breakdown by category</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-4">
                  {isLoading ? (
                    <div className="h-64 w-full flex items-center justify-center">
                      <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                  ) : metrics.topExpenseCategories.length === 0 ? (
                    <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
                      No expense data available
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <Pie data={categoryChartData} options={chartOptions} />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Expenses</CardTitle>
                  <CardDescription>Your largest individual expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))
                  ) : metrics.topExpenseItems.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No expense data available
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {metrics.topExpenseItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-2">
                              <span>{item.date}</span>
                              <span>•</span>
                              <span>{item.category}</span>
                            </div>
                          </div>
                          <div className="font-medium">
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Detailed spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))
                ) : Object.keys(metrics.byCategory).length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No expense data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(metrics.byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, amount], i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{category}</span>
                            <span>{formatCurrency(amount)}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-primary h-full"
                              style={{ 
                                width: `${Math.min(100, (amount / metrics.totalSpending) * 100)}%` 
                              }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {((amount / metrics.totalSpending) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SpendingSummaryReport;
