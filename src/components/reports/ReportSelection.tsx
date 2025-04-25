/**
 * ReportSelection Component
 * 
 * Displays available report types with descriptions and allows users
 * to select which report to generate.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, PieChart, TrendingUp, Calendar, Clock } from 'lucide-react';

// Define report types with their details
const reportTypes = [
  {
    id: 'spending-summary',
    title: 'Spending Summary Report',
    description: 'Shows total spending over a selected period (daily, weekly, monthly, or yearly). Breaks down spending by categories and highlights trends, like overspending in specific categories.',
    icon: <BarChart2 className="h-8 w-8 text-primary" />,
    path: '/reports/spending-summary'
  },
  {
    id: 'category-breakdown',
    title: 'Category Breakdown Report',
    description: 'Detailed analysis of spending within each category, showing subcategories and individual transactions. Identifies your top spending categories.',
    icon: <PieChart className="h-8 w-8 text-primary" />,
    path: '/reports/category-breakdown',
    comingSoon: true
  },
  {
    id: 'financial-dashboard',
    title: 'Financial Dashboard',
    description: 'Interactive dashboard showing key metrics including income vs. expenses, spending trends, and category breakdowns over time.',
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    path: '/reports/dashboard'
  },
  {
    id: 'budget-performance',
    title: 'Budget Performance Report',
    description: 'Compares actual spending against your budgeted amounts for each category, showing variances and adherence to financial goals.',
    icon: <Calendar className="h-8 w-8 text-primary" />,
    path: '/reports/budget-performance',
    comingSoon: true
  },
  {
    id: 'recurring-expenses',
    title: 'Recurring Expenses Report',
    description: 'Identifies and tracks your recurring expenses like subscriptions and regular bills, helping you monitor your fixed costs.',
    icon: <Clock className="h-8 w-8 text-primary" />,
    path: '/reports/recurring-expenses',
    comingSoon: true
  }
];

const ReportSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleReportSelect = (path: string, comingSoon?: boolean) => {
    if (comingSoon) return;
    navigate(path);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card 
            key={report.id} 
            className={`overflow-hidden transition-all hover:shadow-md ${report.comingSoon ? 'opacity-70' : 'cursor-pointer'}`}
            onClick={() => handleReportSelect(report.path, report.comingSoon)}
          >
            <CardHeader className="flex flex-row items-start gap-4 pb-2">
              {report.icon}
              <div>
                <CardTitle className="text-xl text-foreground">{report.title}</CardTitle>
                {report.comingSoon && (
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                    Coming Soon
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-foreground/70 mt-2">
                {report.description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button 
                variant={report.comingSoon ? "outline" : "default"} 
                className="w-full"
                disabled={report.comingSoon}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!report.comingSoon) {
                    navigate(report.path);
                  }
                }}
              >
                {report.comingSoon ? 'Coming Soon' : 'Generate Report'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportSelection;
