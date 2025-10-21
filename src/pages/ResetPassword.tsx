// src/pages/ResetPassword.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 💡 NOVO: Importa o hook customizado
import { useResetPassword } from "@/hooks/useResetPassword";

const ResetPassword = () => {
  // Estado de UI local para controle de visibilidade das senhas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // 💡 HOOK: Toda a lógica de estado, token e submissão
  const { form, isSubmitting, token, isSuccess, onSubmit } = useResetPassword();

  // Se o token for nulo (checado no hook), o hook já deve ter exibido um toast e redirecionado.
  if (!token) {
    return (
        <div className="flex h-screen items-center justify-center">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-primary">
            <Lock className="h-6 w-6" /> Redefinir Senha
          </CardTitle>
          <CardContent className="pt-2 text-muted-foreground">
            Defina sua nova senha.
          </CardContent>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isSuccess ? (
            /* Estado de Sucesso */
            <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-4">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
              <p className="font-semibold text-foreground">
                Senha redefinida com sucesso! Redirecionando para o login...
              </p>
              <Button onClick={() => navigate("/login")} className="w-full">
                Ir para o Login
              </Button>
            </div>
          ) : (
            /* Formulário de Redefinição */
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Campo Nova Senha */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Mínimo de 8 caracteres, letras, números"
                            type={showNewPassword ? "text" : "password"}
                            {...field}
                            disabled={isSubmitting}
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
                
                {/* Campo Confirmar Senha */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Repita a nova senha"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            disabled={isSubmitting}
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
                  className="w-full h-12 font-medium transition-smooth bg-primary hover:bg-primary/90 text-white shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 mr-2" />
                      Redefinir Senha
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;