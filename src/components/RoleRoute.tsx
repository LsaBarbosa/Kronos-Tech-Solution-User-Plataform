import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { AppRole } from "@/config/app-routes";

interface RoleRouteProps {
  allowedRoles: readonly AppRole[];
  redirectTo?: string;
}

const RoleRoute = ({ allowedRoles, redirectTo = "/dashboard" }: RoleRouteProps) => {
  const { role } = useAuth();
  const currentRole = role as AppRole;

  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
