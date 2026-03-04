// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { PUBLIC_ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { status, isAuthenticated } = useAuth();

  if (status === 'checking') {
    return <div className="min-h-screen flex items-center justify-center">Carregando sessão...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={PUBLIC_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
