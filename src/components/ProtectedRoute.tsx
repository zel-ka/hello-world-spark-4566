import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type AppRole } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, roles, loading } = useAuth();
  const location = useLocation();
  const isDoctorOrAdmin = roles.some((role) => role === "doctor" || role === "admin");
  const isPatientRoute = location.pathname === "/patient";
  const canAccessPatientRoute = !isDoctorOrAdmin && (roles.includes("patient") || roles.length === 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isPatientRoute && canAccessPatientRoute) {
    return <>{children}</>;
  }

  if (!allowedRoles.some((role) => roles.includes(role))) {
    return <Navigate to={isDoctorOrAdmin ? "/" : "/patient"} replace />;
  }

  return <>{children}</>;
}
