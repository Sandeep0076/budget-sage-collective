
/**
 * Index Page
 * 
 * Main dashboard page that displays financial overview, recent transactions,
 * and various charts to visualize spending patterns.
 */

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
};

export default Index;
