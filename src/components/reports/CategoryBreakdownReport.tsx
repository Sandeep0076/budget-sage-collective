/**
 * CategoryBreakdownReport Component
 * 
 * Displays detailed analysis of spending within each category,
 * showing subcategories and individual transactions.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions, useCategories } from '@/hooks/useSupabaseQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Filter, Search } from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip as ChartTooltip, 
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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  ChartTooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Transaction type with categories
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
  }
}

// Category summary type
interface CategorySummary {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

// Date range presets similar to SpendingSummaryReport
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
    from: () => startOfMonth(subDays(new Date(), new Date().getDate())),
    to: () => endOfMonth(subDays(new Date(), new Date().getDate()))
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

const CategoryBreakdownReport: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    from: dateRangePresets.last7Days.from(),
    to: dateRangePresets.last7Days.to()
  });
  const [datePreset, setDatePreset] = useState<string>('last7Days');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'overview' | 'details'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Format dates for query
  const formattedStartDate = format(dateRange.from, 'yyyy-MM-dd');
  const formattedEndDate = format(dateRange.to, 'yyyy-MM-dd');
  
  // Get transactions and categories data
  const { data: transactions, isLoading, isError } = useTransactions({
    startDate: formattedStartDate,
    endDate: formattedEndDate
  });
  
  // For debugging - log the transactions data
  React.useEffect(() => {
    console.log('Date range:', formattedStartDate, 'to', formattedEndDate);
    console.log('Transactions received:', transactions?.length);
  }, [transactions, formattedStartDate, formattedEndDate]);
  
  const { data: categories } = useCategories();
  
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
  
  // Calculate category metrics
  const categoryData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      console.log('No transactions available for processing');
      return {
        categorySummaries: [],
        totalSpending: 0,
        transactionsByCategory: {},
        uncategorizedAmount: 0,
        uncategorizedCount: 0
      };
    }
    
    console.log('Processing transactions:', transactions.length);
    // Consider all transactions as expenses for demonstration if needed
    const expenseTransactions = transactions.filter(t => true) as TransactionWithCategory[];
    const totalSpending = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0));
    
    // Group by category and calculate totals
    const categoryMap: Record<string, {
      id: string;
      name: string;
      color: string;
      amount: number;
      transactions: TransactionWithCategory[];
    }> = {};
    
    // Track uncategorized transactions
    let uncategorizedAmount = 0;
    let uncategorizedCount = 0;
    
    expenseTransactions.forEach(t => {
      let categoryId = t.category_id || 'uncategorized';
      let categoryName = t.categories?.name || 'Uncategorized';
      let categoryColor = t.categories?.color || '#808080';
      
      if (!categoryId) {
        uncategorizedAmount += Math.abs(t.amount);
        uncategorizedCount++;
        categoryId = 'uncategorized';
        categoryName = 'Uncategorized';
        categoryColor = '#808080';
      }
      
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          id: categoryId,
          name: categoryName,
          color: categoryColor,
          amount: 0,
          transactions: []
        };
      }
      
      categoryMap[categoryId].amount += Math.abs(t.amount);
      categoryMap[categoryId].transactions.push(t);
    });
    
    // Sort and format category summaries
    const categorySummaries: CategorySummary[] = Object.values(categoryMap)
      .map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        amount: category.amount,
        percentage: (category.amount / totalSpending) * 100,
        transactionCount: category.transactions.length
      }))
      .sort((a, b) => b.amount - a.amount);
    
    return {
      categorySummaries,
      totalSpending,
      transactionsByCategory: categoryMap,
      uncategorizedAmount,
      uncategorizedCount
    };
  }, [transactions]);
  
  // Get transactions for the selected category
  const categoryTransactions = useMemo(() => {
    if (!activeCategory || !categoryData.transactionsByCategory[activeCategory]) {
      return [];
    }
    
    let transactions = categoryData.transactionsByCategory[activeCategory].transactions;
    
    // Apply search filter if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      transactions = transactions.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        format(new Date(t.transaction_date), 'yyyy-MM-dd').includes(query)
      );
    }
    
    // Sort by date (newest first)
    return transactions.sort((a, b) => 
      new Date(b.transaction_date).getTime() - 
      new Date(a.transaction_date).getTime()
    );
  }, [activeCategory, categoryData.transactionsByCategory, searchQuery]);
  
  // Chart data for category breakdown
  const categoryChartData = {
    labels: categoryData.categorySummaries.map(c => c.name),
    datasets: [
      {
        label: 'Spending',
        data: categoryData.categorySummaries.map(c => c.amount),
        backgroundColor: categoryData.categorySummaries.map(c => c.color || 'rgba(54, 162, 235, 0.7)'),
        borderColor: categoryData.categorySummaries.map(c => c.color || 'rgba(54, 162, 235, 1)'),
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'white',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += formatCurrency(context.raw);
              // Add percentage
              const percentage = ((context.raw / categoryData.totalSpending) * 100).toFixed(1);
              label += ` (${percentage}%)`;
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
      currency: 'EUR'
    }).format(amount);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  return (
    <div className="space-y-6 animate-fade-in text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/reports')}
            className="text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="relative rounded-xl overflow-hidden p-6" style={{ 
        backgroundColor: '#0091FF', 
        borderRadius: '16px', 
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)' 
      }}>
        <h1 className="text-2xl font-bold mb-6 text-white">Category Breakdown Report</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Date Range</label>
              <Select 
                value={datePreset} 
                onValueChange={handleDatePresetChange}
              >
                <SelectTrigger className="bg-white/10 border-white/30 text-white">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent className="bg-blue-600 text-white border-white/20">
                  {Object.entries(dateRangePresets).map(([key, preset]) => (
                    <SelectItem key={key} value={key} className="text-white hover:bg-white/10">
                      {preset.label}
                    </SelectItem>
                  ))}
                  {datePreset === 'custom' && (
                    <SelectItem value="custom" className="text-white hover:bg-white/10">Custom Range</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Custom Range</label>
              <DatePickerWithRange 
                date={dateRange} 
                setDate={handleDateRangeChange}
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">View Type</label>
              <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'overview' | 'details')}>
                <TabsList className="bg-white/10 text-white">
                  <TabsTrigger 
                    value="overview" 
                    className={`text-white ${viewType === 'overview' ? 'bg-white/20' : ''}`}
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="details"
                    className={`text-white ${viewType === 'details' ? 'bg-white/20' : ''}`}
                    onClick={() => !activeCategory && categoryData.categorySummaries.length > 0 && 
                      setActiveCategory(categoryData.categorySummaries[0].id)}
                  >
                    Details
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {viewType === 'details' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Select Category</label>
                <Select 
                  value={activeCategory || ''} 
                  onValueChange={setActiveCategory}
                  disabled={categoryData.categorySummaries.length === 0}
                >
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-600 text-white border-white/20">
                    {categoryData.categorySummaries.map(category => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        className="text-white hover:bg-white/10"
                      >
                        {category.name} - {formatCurrency(category.amount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        ) : categoryData.categorySummaries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-medium text-white">No transactions found</p>
            <p className="text-white/70">Try selecting a different date range or adding new transactions.</p>
          </div>
        ) : (
          <>
            <TabsContent value="overview" className="mt-6 p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardDescription className="text-white/70">Total Spending</CardDescription>
                    <CardTitle className="text-3xl text-white">{formatCurrency(categoryData.totalSpending)}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardDescription className="text-white/70">Categories</CardDescription>
                    <CardTitle className="text-3xl text-white">{categoryData.categorySummaries.length}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardDescription className="text-white/70">Uncategorized Spending</CardDescription>
                    <CardTitle className="text-3xl text-white">
                      {formatCurrency(categoryData.uncategorizedAmount)}
                    </CardTitle>
                    <p className="text-sm text-white/70">
                      {categoryData.uncategorizedCount} transaction{categoryData.uncategorizedCount !== 1 ? 's' : ''}
                    </p>
                  </CardHeader>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <Pie data={categoryChartData} options={chartOptions} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryData.categorySummaries.slice(0, 5).map((category) => (
                        <div key={category.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 mr-2 rounded-full" 
                              style={{ backgroundColor: category.color || '#9CA3AF' }}
                            />
                            <span>{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p>{formatCurrency(category.amount)}</p>
                            <p className="text-xs text-white/70">{category.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Card className="bg-white/10 border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">All Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20">
                          <TableHead className="text-white">Category</TableHead>
                          <TableHead className="text-white text-right">Amount</TableHead>
                          <TableHead className="text-white text-right">% of Total</TableHead>
                          <TableHead className="text-white text-right">Transactions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryData.categorySummaries.map((category) => (
                          <TableRow
                            key={category.id}
                            className="border-white/20 hover:bg-white/5"
                            onClick={() => {
                              setActiveCategory(category.id);
                              setViewType('details');
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <TableCell className="flex items-center">
                              <div 
                                className="w-3 h-3 mr-2 rounded-full" 
                                style={{ backgroundColor: category.color || '#9CA3AF' }}
                              />
                              {category.name}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(category.amount)}</TableCell>
                            <TableCell className="text-right">{category.percentage.toFixed(1)}%</TableCell>
                            <TableCell className="text-right">{category.transactionCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-6 p-0">
              {!activeCategory ? (
                <div className="py-12 text-center">
                  <p className="text-lg font-medium text-white">Please select a category</p>
                  <p className="text-white/70">Choose a category to view detailed transactions.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <Card className="bg-white/10 border-white/20 text-white">
                      <CardHeader>
                        <CardTitle className="text-white">
                          {categoryData.transactionsByCategory[activeCategory]?.name || 'Category'} Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm text-white/70">Total Amount</p>
                            <p className="text-xl font-medium text-white">
                              {formatCurrency(categoryData.transactionsByCategory[activeCategory]?.amount || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-white/70">% of Total Spending</p>
                            <p className="text-xl font-medium text-white">
                              {categoryData.transactionsByCategory[activeCategory]
                                ? ((categoryData.transactionsByCategory[activeCategory].amount / categoryData.totalSpending) * 100).toFixed(1)
                                : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-white/70">Transaction Count</p>
                            <p className="text-xl font-medium text-white">
                              {categoryData.transactionsByCategory[activeCategory]?.transactions.length || 0}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-4">
                            <Search className="h-4 w-4 mr-2 text-white" />
                            <Input 
                              placeholder="Search transactions..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                            />
                          </div>
                          
                          <ScrollArea className="h-[400px]">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-white/20">
                                  <TableHead className="text-white">Description</TableHead>
                                  <TableHead className="text-white">Date</TableHead>
                                  <TableHead className="text-white text-right">Amount</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {categoryTransactions.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-white/70">
                                      {searchQuery 
                                        ? 'No transactions match your search'
                                        : 'No transactions found in this category'
                                      }
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  categoryTransactions.map((transaction) => (
                                    <TableRow
                                      key={transaction.id}
                                      className="border-white/20 hover:bg-white/5"
                                    >
                                      <TableCell>{transaction.description || 'Unnamed Transaction'}</TableCell>
                                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                                      <TableCell className="text-right">{formatCurrency(Math.abs(transaction.amount))}</TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryBreakdownReport;
