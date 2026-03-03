// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { hasClientSession } from '@/lib/auth';

const isAuthenticated = () => hasClientSession();

const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
