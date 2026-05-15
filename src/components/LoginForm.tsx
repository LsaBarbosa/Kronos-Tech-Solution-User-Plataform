import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, PasswordInput, FieldGroup } from "@/components/ui";
import Clock from "@/components/Clock";
import { ScanFace } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FaceLoginModal from "@/components/FaceLoginModal";
import { useNavigate, useLocation } from "react-router-dom";
import { loginWithPassword } from "@/service/auth.service";
import { useAuth } from "@/context/AuthContext";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaceLoginOpen, setIsFaceLoginOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if ((location.state as Record<string, unknown>)?.reason === "session_expired") {
      toast.error("Tempo de sessão expirado.");
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await loginWithPassword({ username, password });
      await login();

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard", { replace: true });

    } catch (error) {
      toast.error(
        getServiceErrorMessage(error, "Erro desconhecido ao tentar fazer login.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* Fundo Animado */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float-shapes 20s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.05), transparent)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float-shapes 25s ease-in-out infinite reverse'
            }}
          />
        </div>
      </div>

      <Card className="w-full max-w-md shadow-card border-0 relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent px-2">
            Kronos Plataform
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <FieldGroup>
              <FormInput
                id="username"
                type="text"
                label="Nome de Usuário"
                placeholder="seu.nome.de.usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12"
                required
                disabled={isSubmitting}
              />

              <PasswordInput
                id="password"
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-10"
                required
                disabled={isSubmitting}
              />
            </FieldGroup>
            <div className="flex justify-center mb-4">
              <Clock />
            </div>
            
            <div className="space-y-3">
                <Button
                  type="submit"
                  variant="default" 
                  className="w-full h-12 font-medium transition-smooth bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OU</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Botão para Login Facial */}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 font-medium transition-smooth flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/5"
                    disabled={isSubmitting}
                    onClick={() => setIsFaceLoginOpen(true)}
                >
                    <ScanFace className="h-5 w-5" />
                    Entrar com Biometria Facial
                </Button>
            </div>
          </form>
           <div className="text-center">
            <Button
              variant="link" // Usa o estilo de link, mas com a semântica de botão
              onClick={() => navigate("/senha-primeiro-acesso")} // Chama a nova rota
              className="text-sm text-gray-text hover:text-primary transition-smooth"
            >
              Primeiro acesso/ Recuperar senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Componente do Modal Facial */}
      <FaceLoginModal 
        isOpen={isFaceLoginOpen} 
        onOpenChange={setIsFaceLoginOpen} 
      />

    </div>
  );
};

export default LoginForm;
