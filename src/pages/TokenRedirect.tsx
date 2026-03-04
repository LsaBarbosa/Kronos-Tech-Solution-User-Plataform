import { useEffect } from "react";
import { useSearchParams, useNavigate, Navigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/config/routes";

const TokenRedirect = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate(`/resetar-senha?token=${token}`, { replace: true });
    }
  }, [token, navigate]);

  if (token) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  return <Navigate to={PUBLIC_ROUTES.LOGIN} replace />;
};

export default TokenRedirect;
