/**
 * SimpleAIReportGenerator Component
 * 
 * Provides an AI-assisted report generation based on transaction data.
 * Uses existing transaction data to create useful spending insights.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CustomCard, { CardContent, CardHeader, CardTitle } from '@/components/ui/CustomCard';
import { useTransactions } from '@/hooks/useSupabaseQueries';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format, subMonths } from 'date-fns';
import { Loader2, Download, ArrowLeft } from 'lucide-react';

const SimpleAIReportGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportText, setReportText] = useState<string>('');
  
  // Get transaction data for the last 3 months
  const endDate = new Date();
  const startDate = subMonths(endDate, 3);
  
  const { data: transactions, isLoading } = useTransactions({
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  });

  // Generate a report based on transaction data
  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll generate a simple report based on the available data
      
      if (!transactions || transactions.length === 0) {
        setReportText("No transaction data available for analysis. Please add transactions to generate meaningful reports.");
        setIsGenerating(false);
        return;
      }
      
      // Calculate basic metrics
      const totalExpenses = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
      const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Group by category
      const categorySpending: Record<string, number> = {};
      transactions
        .filter(t => t.amount < 0)
        .forEach(t => {
          const category = t.categories?.name || 'Uncategorized';
          categorySpending[category] = (categorySpending[category] || 0) + Math.abs(t.amount);
        });
      
      // Sort categories by spending amount
      const sortedCategories = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      // Format currency
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD'
        }).format(amount);
      };
      
      // Generate report text
      const reportContent = `
# Spending Summary Report
## ${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}

## Overview
Total Expenses: ${formatCurrency(totalExpenses)}
Total Income: ${formatCurrency(totalIncome)}
Net Balance: ${formatCurrency(totalIncome - totalExpenses)}

## Top Spending Categories
${sortedCategories.map((cat, index) => 
  `${index + 1}. ${cat[0]}: ${formatCurrency(cat[1])} (${((cat[1] / totalExpenses) * 100).toFixed(1)}% of total)`
).join('\n')}

## Analysis and Insights
- ${totalIncome > totalExpenses ? 'You had a positive cash flow during this period. Great job!' : 'You spent more than you earned during this period. Consider reviewing your budget.'}
- Your highest spending category was ${sortedCategories[0]?.[0] || 'N/A'}, accounting for ${sortedCategories[0] ? ((sortedCategories[0][1] / totalExpenses) * 100).toFixed(1) : 0}% of your total expenses.
${sortedCategories[0]?.[0] === 'Food' ? '- Food expenses are significant. Consider meal planning to reduce costs.' : ''}
${sortedCategories[0]?.[0] === 'Entertainment' ? '- Entertainment expenses are high. Look for free or lower-cost alternatives.' : ''}
${sortedCategories[0]?.[0] === 'Housing' ? '- Housing is your largest expense. This is normal, but ensure it stays under 30% of your income.' : ''}
${sortedCategories[0]?.[0] === 'Transportation' ? '- Transportation costs are significant. Consider carpooling or public transit.' : ''}

## Recommendations
1. Set up category-specific budgets to better track and control your spending.
2. ${totalIncome <= totalExpenses ? 'Look for ways to increase your income or reduce expenses.' : 'Consider increasing your savings or investments.'}
3. Review recurring expenses and subscriptions to identify potential savings.
4. Track your expenses more regularly to stay on top of your financial situation.

This report was automatically generated based on your transaction data.
      `;
      
      setReportText(reportContent);
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report', {
        description: 'Please try again later'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Export the report as a text file
  const handleExport = () => {
    if (!reportText) return;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spending_Report_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };
  
  return (
    <div className="space-y-6 animate-fade-in" style={{ color: 'white' }}>
      <div className="relative rounded-xl overflow-hidden p-5" style={{ 
        backgroundColor: 'rgba(0, 116, 212, 0.6)', 
        backdropFilter: 'blur(10px)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold leading-none tracking-tight text-white">
            AI-Assisted Spending Report
          </h3>
          
          {reportText && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-white border-white/30 hover:bg-white/10"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative rounded-xl overflow-hidden p-5" style={{ 
        backgroundColor: 'rgba(0, 116, 212, 0.6)', 
        backdropFilter: 'blur(10px)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <span className="ml-2 text-white">Loading transaction data...</span>
            </div>
          ) : (
            <>
              {!reportText ? (
                <div className="space-y-4">
                  <p style={{ color: 'white' }}>
                    Generate an AI-assisted spending analysis based on your transaction history.
                    This report will include spending patterns, top expense categories, and personalized recommendations.
                  </p>
                  
                  <Button 
                    onClick={generateReport} 
                    disabled={isGenerating || !transactions || transactions.length === 0}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      'Generate AI Report'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    value={reportText} 
                    onChange={(e) => setReportText(e.target.value)}
                    className="min-h-[500px] font-mono whitespace-pre-wrap"
                    style={{ 
                      color: 'white', 
                      backgroundColor: 'rgba(0, 70, 130, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setReportText('')}
                      className="mr-2"
                      style={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      Generate New Report
                    </Button>
                    
                    <Button onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleAIReportGenerator;
