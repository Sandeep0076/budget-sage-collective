
/**
 * Scan Receipt Page
 * 
 * Allows users to scan receipts using their camera or upload receipt images,
 * extracts information using AI, and adds it to transactions.
 */

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ReceiptScanner } from '@/components/receipts';

const ScanReceipt = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in gradient-bg min-h-screen px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Scan Receipt</h1>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        <ReceiptScanner />
      </div>
    </AppLayout>
  );
};

export default ScanReceipt;
