
/**
 * Transactions Page
 * 
 * Allows users to view, add, edit, and delete financial transactions.
 * Includes a transaction list with filtering capabilities and a form
 * for adding new transactions.
 */

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Transactions = () => {
  const [showForm, setShowForm] = useState(false);

  const handleFormSubmit = (data: any) => {
    console.log('Transaction submitted:', data);
    setShowForm(false);
    toast({
      title: "Transaction added",
      description: "Your transaction has been added successfully"
    });
  };

  const handleShowForm = () => {
    setShowForm(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          {!showForm && (
            <Button onClick={handleShowForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          )}
          {showForm && (
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>

        {showForm ? (
          <TransactionForm 
            onSubmit={handleFormSubmit} 
            onCancel={() => setShowForm(false)} 
          />
        ) : (
          <TransactionList onAddNew={handleShowForm} />
        )}
      </div>
    </AppLayout>
  );
};

export default Transactions;
