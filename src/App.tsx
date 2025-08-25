import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Logo } from "@/components/ui/logo";

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
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-surface-muted">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-6" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

// Admin Route Component - Only for admin users
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, customUser } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-surface-muted">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-6" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-surface-muted">
        <div className="text-center">
          <Logo size="lg" className="mx-auto mb-6" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            
            {/* Test Route */}
            <Route path="/test" element={<TestPage />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
