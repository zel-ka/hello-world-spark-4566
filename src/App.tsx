import { useState } from "react";
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
import PwaAuth from "@/pages/PwaAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { I18nProvider } from "@/hooks/useI18n";
import { useIsStandalone } from "@/hooks/use-is-standalone";
import { SplashScreen } from "@/components/pwa/SplashScreen";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, roles, loading } = useAuth();
  const isStandalone = useIsStandalone();
  const [splashDone, setSplashDone] = useState(false);

  // Installed PWA: show splash screen on cold start.
  if (isStandalone && !splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Installed PWA → skip marketing/landing entirely, go straight to auth.
    if (isStandalone) {
      return (
        <Routes>
          <Route path="/*" element={<PwaAuth />} />
        </Routes>
      );
    }

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

  const defaultPath = "/patient";

  return (
    <Routes>
      {/* Public pages for all users */}
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/shop" element={<Shop />} />

      {/* Patient dashboard - default for everyone */}
      <Route path="/patient" element={<PatientDashboard />} />

      {/* Admin/Doctor dashboard kept available but not default */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["doctor", "admin"]}>
            <Index />
          </ProtectedRoute>
        }
      />

      {/* Catch-all - all logged in users land on patient dashboard */}
      <Route path="/*" element={<Navigate to="/patient" replace />} />
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
            <OfflineIndicator />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
