import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTawkWidget } from "@/hooks/useTawkWidget";

const ProtectedRoute = () => {
  const { status, isAuthenticated, checkSession } = useAuth();
  useTawkWidget({ isAuthenticated });

  useEffect(() => {
    if (status === "checking") {
      void checkSession();
    }
  }, [status, checkSession]);

  if (status === "checking") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-background flex items-center justify-center text-muted-foreground"
      >
        Carregando sessão...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
