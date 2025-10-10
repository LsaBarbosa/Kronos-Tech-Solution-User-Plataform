// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const isAuthenticated = () => {
  // A verificação é a existência de um token em localStorage.
  // Este é o token persistido no LoginForm.tsx após o login com sucesso.
  return localStorage.getItem('token') !== null;
};

const ProtectedRoute = () => {
  // Se o usuário não estiver autenticado, redireciona para a página de login.
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // Se estiver autenticado, renderiza as rotas filhas (Outlet).
  return <Outlet />;
};

export default ProtectedRoute;