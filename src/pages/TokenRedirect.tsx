import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Login from "../pages/Login"; // Certifique-se do caminho correto

const TokenRedirect = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Se houver um token, redireciona para a rota de redefinição de senha,
      // mantendo o token na URL para o ResetPassword.tsx usar.
      navigate(`/resetar-senha?token=${token}`, { replace: true });
    }
  }, [token, navigate]);

  // Se não houver token, renderiza a tela de Login padrão
  if (token) {
    // Pode exibir um loader enquanto o redirecionamento ocorre
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  // Se não houver token, carrega a tela de login (que está na rota "/")
  return <Login />;
};

export default TokenRedirect;