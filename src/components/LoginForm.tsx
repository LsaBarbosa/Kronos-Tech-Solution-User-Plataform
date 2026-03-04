import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Clock from "@/components/Clock";
import { Eye, EyeOff, ScanFace } from "lucide-react"; // Adicionado ScanFace
import { toast } from "sonner"; // Ajustado import para sonner padrão se necessário, ou "@/components/ui/sonner"
import { API_BASE_URL } from "@/config/api";
import FaceLoginModal from "@/components/FaceLoginModal"; // Import do novo modal
import { useNavigate } from "react-router-dom";
import type { LoginResponse } from "@/types/auth";

const API_URL = `${API_BASE_URL}auth/login`;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFaceLoginOpen, setIsFaceLoginOpen] = useState(false); // Estado do modal facial

  const navigate = useNavigate(); 
  const { checkSession } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Usuário ou senha inválidos.");
      }

      // Backend pode retornar payload adicional; autenticação depende do cookie de sessão.
      await response.json().catch((): LoginResponse | null => null);

      toast.success("Login realizado com sucesso!");

      // Pequeno delay para o usuário ver o feedback
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 800);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao tentar fazer login.";
      toast.error(errorMessage);
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
          <CardTitle className="text-3xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent px-2">
              Kronos Plataform
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-black-primary">
                Nome de Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="seu.nome.de.usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 border-gray-border focus:border-primary focus:ring-primary shadow-input transition-smooth"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-black-primary">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12 border-gray-border focus:border-primary focus:ring-primary shadow-input transition-smooth"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text hover:text-primary transition-smooth"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
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
