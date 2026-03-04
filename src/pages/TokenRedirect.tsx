import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Login from "../pages/Login";

const TokenRedirect = () => {
  const [searchParams] = useSearchParams();

  /**
   * `?token=` nesta rota representa APENAS o token de redefinição de senha.
   *
   * Escopo:
   * - usado exclusivamente para redirecionar para `/resetar-senha`
   * - não é token de login/sessão
   * - não deve ser persistido em storage nem reutilizado em headers de autenticação
   */
  const passwordResetToken = searchParams.get("token");

  const navigate = useNavigate();

  useEffect(() => {
    if (passwordResetToken) {
      navigate(`/resetar-senha?token=${passwordResetToken}`, { replace: true });
    }
  }, [passwordResetToken, navigate]);

  if (passwordResetToken) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  return <Login />;
};

export default TokenRedirect;
