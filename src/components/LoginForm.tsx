import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, LogIn, ScanFace, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, FormInput, PasswordInput } from "@/components/ui";
import FaceLoginModal from "@/components/FaceLoginModal";
import { BiometricConsentGuard } from "@/components/BiometricConsentGuard";
import { useAuth } from "@/context/AuthContext";
import { loginWithPassword } from "@/service/auth.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { toast } from "@/hooks/use-toast";
import { APP_PATHS } from "@/config/app-routes";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaceLoginOpen, setIsFaceLoginOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if ((location.state as Record<string, unknown> | null)?.reason === "session_expired") {
      toast.error("Tempo de sessão expirado.");
    }
  }, [location]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await loginWithPassword({ username, password });
      await login();
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getServiceErrorMessage(error, "Erro desconhecido ao tentar fazer login."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-[#E2E8F0] bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
        <div className="space-y-1 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-5">
          <Badge className="border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Acesso protegido
          </Badge>
          <h2 className="text-xl font-semibold text-[#0F172A] sm:text-2xl">
            Entrar na plataforma
          </h2>
          <p className="text-sm text-[#64748B]">
            Use seu usuário corporativo ou biometria facial.
          </p>
        </div>

        <CardContent className="space-y-5 px-6 py-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <FieldGroup>
              <FormInput
                id="username"
                type="text"
                label="Nome de Usuário"
                placeholder="seu.nome.de.usuario"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-12"
                required
                disabled={isSubmitting}
                autoComplete="username"
              />
              <PasswordInput
                id="password"
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 pr-10"
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </FieldGroup>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogIn className="h-4 w-4" aria-hidden="true" />
              )}
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-[#E2E8F0]" />
            <span className="mx-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
              ou
            </span>
            <div className="flex-grow border-t border-[#E2E8F0]" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setIsFaceLoginOpen(true)}
            className="h-12 w-full gap-2 border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6] hover:bg-[#EDE9FE]"
          >
            <ScanFace className="h-5 w-5" />
            Entrar com Biometria Facial
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => navigate(APP_PATHS.senhaPrimeiroAcesso)}
              className="h-auto p-0 text-sm text-[#1D4ED8] hover:text-[#1E3A8A]"
            >
              Primeiro acesso / Recuperar senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {isFaceLoginOpen ? (
        <BiometricConsentGuard onCancel={() => setIsFaceLoginOpen(false)}>
          <FaceLoginModal isOpen={isFaceLoginOpen} onOpenChange={setIsFaceLoginOpen} />
        </BiometricConsentGuard>
      ) : null}
    </>
  );
};

export default LoginForm;
