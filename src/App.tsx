import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/Landing";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Features from "@/pages/Features";
import Shop from "@/pages/Shop";
import Index from "@/pages/Index";
import PatientDashboard from "@/pages/PatientDashboard";
import GuestDashboard from "@/pages/GuestDashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { I18nProvider } from "@/hooks/useI18n";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/try" element={<GuestDashboard />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="/*" element={<Landing />} />
      </Routes>
    );
  }

  // Role-based routing - with proper priority (admin > doctor > patient)
  const isAdmin = roles.includes("admin");
  const isDoctor = roles.includes("doctor");
  const isPatient = roles.includes("patient");

  const defaultPath = isAdmin || isDoctor ? "/" : isPatient ? "/patient" : "/patient";

  return (
    <Routes>
      {/* Main dashboard for Doctor and Admin */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["doctor", "admin"]}>
            <Index />
          </ProtectedRoute>
        }
      />
      
      {/* Public pages for all users */}
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/shop" element={<Shop />} />

      {/* Patient dashboard */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route - improved patient default */}
      <Route path="/*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
