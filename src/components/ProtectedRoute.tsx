import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = () => {
  const { status, checkSession } = useAuth();

  useEffect(() => {
    if (status === "checking") {
      void checkSession();
    }
  }, []);

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
