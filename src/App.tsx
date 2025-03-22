
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Bills from '@/pages/Bills';
import Budgets from '@/pages/Budgets';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/hooks/useAuth';
import './App.css';

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Index />} />
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
      <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/auth" />} />
      <Route path="/bills" element={isAuthenticated ? <Bills /> : <Navigate to="/auth" />} />
      <Route path="/budgets" element={isAuthenticated ? <Budgets /> : <Navigate to="/auth" />} />
      <Route path="/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/auth" />} />
      <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
