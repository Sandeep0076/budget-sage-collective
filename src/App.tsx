
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';
import PWAUpdateNotification from '@/components/ui/PWAUpdateNotification';
import './App.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Budgets = lazy(() => import('@/pages/Budgets'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const Auth = lazy(() => import('@/pages/Auth'));
const Index = lazy(() => import('@/pages/Index'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Bills = lazy(() => import('@/pages/Bills'));

// Loading fallback
const Loading = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
);

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
    <>
      <Suspense fallback={<Loading />}>
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
      </Suspense>
      <Toaster />
      <PWAUpdateNotification />
    </>
  );
};

export default App;
