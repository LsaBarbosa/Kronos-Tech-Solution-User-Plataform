import { useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Login from "./Login";
import { LOGIN_ROUTE, PUBLIC_ROUTES } from "@/config/routes";

const TokenRedirect = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      navigate(`${PUBLIC_ROUTES.RESET_PASSWORD}?token=${token}`, { replace: true });
      return;
    }

    if (location.pathname !== LOGIN_ROUTE) {
      navigate(LOGIN_ROUTE, { replace: true });
    }
  }, [token, navigate, location.pathname]);

  if (token) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  return <Login />;
};

export default TokenRedirect;
