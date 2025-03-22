
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';

const DashboardPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <Dashboard />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
