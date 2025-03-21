
/**
 * FinancialReports Component
 * 
 * Main component for financial analytics displaying various reports
 * including income vs expenses, spending trends, and category breakdowns.
 */

import React, { useState } from 'react';
import { useYearlyFinancials, useMonthlySpending } from '@/hooks/useSupabaseQueries';
import IncomeVsExpenses from './IncomeVsExpenses';
import SpendingTrends from './SpendingTrends';
import CategoryBreakdown from './CategoryBreakdown';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FinancialReports: React.FC = () => {
  // Initialize with current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [timeFrame, setTimeFrame] = useState<'monthly' | 'yearly'>('monthly');
  
  // Generate year options
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Handle time period navigation
  const handleNextPeriod = () => {
    if (timeFrame === 'monthly') {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else {
      setSelectedYear(selectedYear + 1);
    }
  };
  
  const handlePreviousPeriod = () => {
    if (timeFrame === 'monthly') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      setSelectedYear(selectedYear - 1);
    }
  };
  
  // Prevent navigating to future periods
  const isCurrentPeriod = timeFrame === 'monthly' 
    ? selectedYear === currentYear && selectedMonth === currentMonth
    : selectedYear === currentYear;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Tabs 
          defaultValue="monthly" 
          value={timeFrame}
          onValueChange={(value) => setTimeFrame(value as 'monthly' | 'yearly')}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousPeriod}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {timeFrame === 'monthly' ? (
            <div className="flex items-center space-x-2">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPeriod}
            disabled={isCurrentPeriod}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {timeFrame === 'monthly' ? (
          <>
            <IncomeVsExpenses 
              month={selectedMonth} 
              year={selectedYear} 
            />
            <CategoryBreakdown 
              month={selectedMonth} 
              year={selectedYear} 
            />
          </>
        ) : (
          <>
            <SpendingTrends 
              year={selectedYear} 
            />
            <CategoryBreakdown 
              year={selectedYear} 
              isYearly
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
