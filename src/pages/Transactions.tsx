
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
      title: data.is_recurring ? "Recurring transaction added" : "Transaction added",
      description: data.is_recurring 
        ? `Your recurring ${data.transaction_type} has been scheduled` 
        : "Your transaction has been added successfully"
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
      <div className="space-y-6 animate-fade-in p-6 overflow-visible bg-gradient-to-b from-background to-background/80">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="icon" onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
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
