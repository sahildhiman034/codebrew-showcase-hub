import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Logo } from "@/components/ui/logo";
import { AIChatbot } from "@/components/ui/ai-chatbot";
import { StaticChatbot } from "@/components/ui/static-chatbot";
import { CustomLoader } from "@/components/ui/custom-loader";
import React from "react";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CategoryPage from "./pages/CategoryPage";
import StatusMonitor from "./pages/StatusMonitor";
import IntegrationsConfig from "./pages/IntegrationsConfig";
import NotFound from "./pages/NotFound";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDemos from "./pages/admin/AdminDemos";
import AdminClients from "./pages/admin/AdminClients";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminChatbot from "./pages/admin/AdminChatbot";
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient();



// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <CustomLoader size="md" />;
  }
  
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

// Admin Route Component - Only for admin users
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, customUser } = useAuth();
  
  if (loading) {
    return <CustomLoader size="md" />;
  }
  
  // Check if user is logged in and has admin role
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (!isAdmin && customUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <CustomLoader size="md" />;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const App = () => {

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {process.env.NODE_ENV === 'development' ? (
              <AIChatbot 
                position="bottom-right"
                theme="light"
              />
            ) : (
              <StaticChatbot 
                position="bottom-right"
                theme="light"
              />
            )}
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={
                    <PublicRoute>
                      <Auth />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected Dashboard Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Dashboard />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/category/:category" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <CategoryPage />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/status" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <StatusMonitor />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/integrations" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <IntegrationsConfig />
                      </DashboardLayout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/categories" 
                  element={
                    <AdminRoute>
                      <DashboardLayout>
                        <AdminCategories />
                      </DashboardLayout>
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/demos" 
                  element={
                    <AdminRoute>
                      <DashboardLayout>
                        <AdminDemos />
                      </DashboardLayout>
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/clients" 
                  element={
                    <AdminRoute>
                      <DashboardLayout>
                        <AdminClients />
                      </DashboardLayout>
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/users" 
                  element={
                    <AdminRoute>
                      <DashboardLayout>
                        <AdminUsers />
                      </DashboardLayout>
                    </AdminRoute>
                  } 
                />
                
                <Route 
                  path="/admin/chatbot" 
                  element={
                    <AdminRoute>
                      <DashboardLayout>
                        <AdminChatbot />
                      </DashboardLayout>
                    </AdminRoute>
                  } 
                />
                
                {/* Test Route */}
                <Route path="/test" element={<TestPage />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
