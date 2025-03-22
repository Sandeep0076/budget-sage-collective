
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import BillsComponent from '@/components/bills/Bills';

const Bills = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <BillsComponent />
      </div>
    </AppLayout>
  );
};

export default Bills;
