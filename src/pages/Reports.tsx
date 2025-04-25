
/**
 * Reports Page
 * 
 * Displays financial reports and analytics options, allowing users
 * to select which reports they want to generate.
 */

import React from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import ReportSelection from '@/components/reports/ReportSelection';
import SpendingSummaryReport from '@/components/reports/SpendingSummaryReport';
import FinancialReports from '@/components/reports/FinancialReports';

const Reports = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Simple content renderer to avoid duplicate AppLayout wrapping
  const renderReportContent = () => {
    // Main Reports page
    if (currentPath === '/reports') {
      return (
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
      );
    }
    
    // Spending Summary Report
    if (currentPath === '/reports/spending-summary') {
      return <SpendingSummaryReport />;
    }
    
    // Financial Dashboard
    if (currentPath === '/reports/dashboard') {
      return <FinancialReports />;
    }
    
    // Fallback - redirect to main reports page
    navigate('/reports');
    return null;
  };

  return (
    <AppLayout>
      {renderReportContent()}
    </AppLayout>
  );
};

export default Reports;
