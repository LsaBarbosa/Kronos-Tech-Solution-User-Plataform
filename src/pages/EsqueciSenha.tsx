import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, User, Loader2, Lock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { API_BASE_URL } from "@/config/api";
import * as z from "zod";

// DTO do Backend: RecoverPasswordRequest(cpf, email)
const formSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  email: z.string().email("Email inválido"),
});

const API_RECOVER_URL = `${API_BASE_URL}auth/recover-password`;

const EsqueciSenha = () => {
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Função de máscara de CPF (copiada de CriarColaborador.tsx)
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      // 1. Validação local dos dados
      const cleanCpf = cpf.replace(/\D/g, "");
      formSchema.parse({ cpf: cleanCpf, email });
      
      const payload = {
        cpf: cleanCpf,
        email: email.trim().toLowerCase(),
      };

      // 2. Chamada à API
      const response = await fetch(API_RECOVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // O backend retorna 204 No Content, mesmo em caso de erro de CPF/Email, por segurança.
      // A única falha que devemos tratar é se a requisição não for 2xx (ex: 400, 500)
      if (!response.ok && response.status !== 204) {
         // Tentativa de extrair erro detalhado para fins de debug, mas o 
         // comportamento esperado é tratar o 400/500
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro no servidor. Tente novamente.");
      }
      
      // 3. Sucesso (Mensagem genérica para segurança)
      setIsSuccess(true);
      toast.success(
        "Instruções enviadas!",
        {
            description: "Se o CPF e E-mail estiverem corretos, você receberá um link de recuperação em sua caixa de entrada.",
            duration: 8000,
            dismissible: true,
        }
      );

    } catch (error: any) {
      const errorMessage = error.issues 
        ? error.issues[0].message // Zod validation error
        : error.message || "Erro desconhecido ao solicitar recuperação.";

      toast.error(
        "Erro na solicitação",
        { description: errorMessage }
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // O layout é copiado do LoginForm.tsx para manter o padrão visual (tema e animações)
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background - Padrão do projeto */}
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
<Card className="border-l-4 border-l-primary shadow-card">
      <Card className="w-full max-w-md shadow-card border-0 relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-3xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Lock className="h-6 w-6" /> Esqueci a Senha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="h-16 w-16 text-success mx-auto animate-bounce" />
              <p className="text-lg font-semibold text-foreground">
                Email de recuperação enviado!
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique sua caixa de entrada (e spam) para o link de redefinição.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRecover} className="space-y-6">
              
              <p className="text-sm text-muted-foreground text-center">
                Para redefinir sua senha, informe seu CPF e o e-mail cadastrado.
              </p>

              {/* CPF Field */}
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm font-medium text-black-primary">
                  CPF (Apenas números)
                </Label>
                <div className="relative">
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    className="h-12 pr-12 border-gray-border focus:border-primary focus:ring-primary shadow-input transition-smooth"
                    required
                    disabled={isSubmitting}
                    maxLength={14}
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-text" />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-black-primary">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pr-12 border-gray-border focus:border-primary focus:ring-primary shadow-input transition-smooth"
                    required
                    disabled={isSubmitting}
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-text" />
                </div>
              </div>

              <Button
                type="submit"
                variant="login"
                className="w-full h-12 font-medium transition-smooth"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando solicitação...
                  </>
                ) : (
                  "Solicitar Recuperação"
                )}
              </Button>
            </form>
          )}

          {/* Link para voltar ao Login */}
          <div className="text-center pt-2">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-sm text-gray-text hover:text-primary transition-smooth"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Login
            </Button>
          </div>
        </CardContent>
      </Card>
      </Card>
    </div>
  );
};

export default EsqueciSenha;