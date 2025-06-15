
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts
import { AppLayout } from "./components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FeedbackSubmission from "./pages/FeedbackSubmission";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireLecturer = false,
  requireStudent = false
}: { 
  children: JSX.Element;
  requireAdmin?: boolean;
  requireLecturer?: boolean;
  requireStudent?: boolean;
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (requireLecturer && user?.role !== "lecturer" && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (requireStudent && user?.role !== "student") {
    return <Navigate to="/lecturer" replace />;
  }
  
  return children;
};

// Root component with routes
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? (
          user?.role === "admin" ? 
            <Navigate to="/admin" replace /> : 
            user?.role === "lecturer" ?
            <Navigate to="/lecturer" replace /> :
            <Navigate to="/" replace />
        ) : <Login />
      } />
      
      <Route path="/" element={
        <ProtectedRoute requireStudent>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/lecturer" element={
        <ProtectedRoute requireLecturer>
          <AppLayout>
            <LecturerDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/feedback" element={
        <ProtectedRoute requireStudent>
          <AppLayout>
            <FeedbackSubmission />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <Analytics />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute requireAdmin>
          <AppLayout>
            <Reports />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
