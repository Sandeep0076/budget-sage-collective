
/**
 * Reports Page
 * 
 * Displays financial reports and analytics including income vs. expenses,
 * spending trends, and category breakdowns over time.
 */

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import FinancialReports from '@/components/reports/FinancialReports';

const Reports = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long'
            })}
          </div>
        </div>
        
        <FinancialReports />
      </div>
    </AppLayout>
  );
};

export default Reports;
