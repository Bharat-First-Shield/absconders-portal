import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Toaster } from 'react-hot-toast';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { CaseList } from './pages/CaseList';
import { CaseForm } from './pages/CaseForm';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Search } from './pages/Search';
import { useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AnimatePresence } from 'framer-motion';

// Lazy load components
const CaseDetail = lazy(() => import('./pages/CaseDetail').then(module => ({ default: module.CaseDetail })));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children, requiredRoles = ['admin', 'investigator', 'viewer'] }: { children: React.ReactNode, requiredRoles?: string[] }) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!hasPermission(requiredRoles as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            }>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="cases" element={<CaseList />} />
                    <Route path="cases/:id" element={<CaseDetail />} />
                    <Route 
                      path="cases/new" 
                      element={
                        <ProtectedRoute requiredRoles={['admin', 'investigator']}>
                          <CaseForm />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="cases/:id/edit" 
                      element={
                        <ProtectedRoute requiredRoles={['admin', 'investigator']}>
                          <CaseForm />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="search" element={<Search />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="reports" element={<Reports />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;