
/**
 * Reports Page
 * 
 * Displays financial reports and analytics options, allowing users
 * to select which reports they want to generate.
 */

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ReportSelection from '@/components/reports/ReportSelection';
import SpendingSummaryReport from '@/components/reports/SpendingSummaryReport';
import FinancialReports from '@/components/reports/FinancialReports';

const Reports = () => {
  const location = useLocation();
  const isMainReportsPage = location.pathname === '/reports';

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={
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
            
            <ReportSelection />
          </div>
        } />
        <Route path="/spending-summary" element={<SpendingSummaryReport />} />
        <Route path="/dashboard" element={<FinancialReports />} />
      </Routes>
    </AppLayout>
  );
};

export default Reports;
