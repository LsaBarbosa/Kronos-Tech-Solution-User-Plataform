// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { getStoredToken } from '@/lib/auth';

const isAuthenticated = () => getStoredToken() !== null;

const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
