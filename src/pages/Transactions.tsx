
/**
 * Transactions Page
 * 
 * Allows users to view, add, edit, and delete financial transactions.
 * Includes a transaction list with filtering capabilities and a form
 * for adding new transactions.
 */

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Transactions = () => {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('Transactions page mounted');
  }, []);

  const handleFormSubmit = (data: any) => {
    console.log('Transaction submitted:', data);
    setShowForm(false);
    toast({
      title: "Transaction added",
      description: "Your transaction has been added successfully"
    });
  };
  
  const handleFormError = (error: any) => {
    console.error('Transaction form error:', error);
    setError(error.message || 'An error occurred with the transaction form');
  };

  const handleShowForm = () => {
    setShowForm(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <Button variant="ghost" onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </Button>
            </span>
          </div>
        )}
        
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
          <div className="transaction-form-container">
            <TransactionForm 
              onSubmit={handleFormSubmit} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        ) : (
          <TransactionList onAddNew={handleShowForm} />
        )}
      </div>
    </AppLayout>
  );
};

export default Transactions;
