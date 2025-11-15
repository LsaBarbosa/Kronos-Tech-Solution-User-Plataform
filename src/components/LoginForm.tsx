import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { API_BASE_URL } from "@/config/api";

const API_URL = `${API_BASE_URL}auth/login`;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      // --- ALTERAÇÃO AQUI ---
      if (!response.ok) {
        // Tenta extrair a mensagem de erro detalhada da API
        const errorData = await response.json();
        // Usa a mensagem do campo 'detail' se existir, senão usa uma mensagem padrão
        throw new Error(errorData.detail || "Usuário ou senha inválidos.");
      }

      const data = await response.json();

      // Persistir o token no localStorage
      localStorage.setItem("token", data.token);

      // Exibir aviso importante por 10 segundos
      setTimeout(() => {
        toast.warning("Atenção!!\nAjuste sua folha de ponto antes do fechamento da folha !", {
          duration: 5000,
          dismissible: true,
        });
      }, 500);

      // Navegar para o dashboard
      navigate("/dashboard");

    } catch (error) {
      // A mensagem de erro agora virá do 'throw new Error' acima
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao tentar fazer login.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />

        {/* Floating Geometric Shapes */}
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
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)',
              borderRadius: '50%',
              animation: 'float-shapes 18s ease-in-out infinite 5s'
            }}
          />
        </div>
      </div>

      <Card className="w-full max-w-md shadow-card border-0 relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Login
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

            <Button
              type="submit"
              variant="login"
              className="w-full h-12 font-medium transition-smooth"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
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
    </div>
  );
};

export default LoginForm;



