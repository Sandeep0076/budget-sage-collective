
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/context/AuthProvider';
import { registerServiceWorker } from './pwaRegistration';
import './index.css';

// Register the service worker for PWA support
registerServiceWorker();

// Create a query client for React Query with improved configuration to prevent flickering
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // Cache data for 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1, // Only retry failed requests once
      // Use previous data while loading new data
      placeholderData: (previousData) => previousData
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="budget-sage-theme">
          <AuthProvider>
            <App />
            <Toaster richColors />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
