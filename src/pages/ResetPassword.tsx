import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";

const RESET_PASSWORD_URL = `${API_BASE_URL}auth/reset-password`;

// Schema de validação: deve ser a mesma política do backend
const passwordValidation = z
  .string()
  .min(8, "Mínimo de 8 caracteres")
  .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
  .regex(/\d/, "Deve conter pelo menos um dígito");

const formSchema = z
  .object({
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // 1. Verifica a presença do token
  useEffect(() => {
    if (!token) {
      toast.error("Token de redefinição não encontrado na URL.");
      navigate("/login"); // Redireciona para o login
    }
  }, [token, navigate]);

  // 2. Função de submissão do formulário
  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token inválido.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        token: token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      };

      const response = await fetch(RESET_PASSWORD_URL, {
        method: "POST", // Endpoint do backend: /auth/reset-password
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // O backend retorna o erro no campo 'detail' ou 'message'
        throw new Error(errorData.detail || errorData.message || "Erro ao redefinir a senha.");
      }

      toast.success("Senha redefinida com sucesso! Faça login com sua nova senha.");
      form.reset();
      navigate("/"); // Redireciona para a tela de login

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao redefinir a senha.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    // Renderiza um placeholder enquanto o useEffect redireciona ou espera
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 3. Renderiza o formulário
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* Background animado (copiado de LoginForm.tsx) */}
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
            Redefinir Senha
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use um token válido para criar sua nova senha.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Nova Senha */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Nova Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-12 pr-12 border-gray-border focus:border-primary focus:ring-primary shadow-input transition-smooth"
                          required
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-smooth h-8 w-8 p-0"
                        variant="ghost"
                        disabled={isSubmitting}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirmação de Senha */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Confirme a Nova Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-12 pr-12 border-gray-border focus:border-primary focus:ring-primary shadow-input transition-smooth"
                          required
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-smooth h-8 w-8 p-0"
                        variant="ghost"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="default"
                className="w-full h-12 font-medium transition-smooth bg-primary hover:bg-primary/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Lock className="h-5 w-5 mr-2" />
                )}
                {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;