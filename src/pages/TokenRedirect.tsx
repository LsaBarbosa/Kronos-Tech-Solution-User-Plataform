import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CommercialLanding from "./CommercialLanding";

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return <CommercialLanding />;
};

export default TokenRedirect;
