import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.ts';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import Transactions from '@/pages/Transactions';
import Reports from '@/pages/Reports';
import Budgets from '@/pages/Budgets';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import ScanReceipt from '@/pages/ScanReceipt';
import Bills from '@/pages/Bills';
import './App.css';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
      <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/auth" />} />
      <Route path="/reports" element={isAuthenticated ? <Reports /> : <Navigate to="/auth" />} />
      <Route path="/budgets" element={isAuthenticated ? <Budgets /> : <Navigate to="/auth" />} />
      <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />} />
      <Route path="/scan-receipt" element={isAuthenticated ? <ScanReceipt /> : <Navigate to="/auth" />} />
      <Route path="/bills" element={isAuthenticated ? <Bills /> : <Navigate to="/auth" />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

