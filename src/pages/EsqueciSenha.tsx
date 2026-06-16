// src/pages/EsqueciSenha.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Mail, User, Loader2, Lock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 💡 NOVO: Importa o hook customizado
import { useForgotPassword } from "@/hooks/useForgotPassword";
// 💡 NOVO: Importa utilitários de tipo
import { maskCPF } from "@/types/auth";


const EsqueciSenha = () => {
  const navigate = useNavigate();
  
  // 💡 HOOK: Toda a lógica de estado e submissão
  const { form, isSubmitting, isSuccess, onSubmit } = useForgotPassword();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-primary">
            <Lock className="h-6 w-6" /> Solicitar Senha
          </CardTitle>
          <CardContent className="pt-2 text-muted-foreground">
            {isSuccess ? 
              "Sua solicitação foi enviada com sucesso!" : 
              "Informe seu CPF e e-mail cadastrado para receber um link de redefinição."
            }
          </CardContent>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isSuccess ? (
            /* Estado de Sucesso */
            <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-4">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
              <p className="font-semibold text-foreground">
                Instruções enviadas para o e-mail: <br />
                <span className="text-sm font-normal text-muted-foreground italic">{form.getValues("email")}</span>
              </p>
              <Button onClick={() => navigate("/login")} className="w-full">
                Ir para o Login
              </Button>
            </div>
          ) : (
            /* Formulário de Recuperação */
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Campo CPF */}
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="000.000.000-00" 
                            maxLength={14}
                            {...field}
                            // 💡 Uso da função utilitária para formatação de exibição
                            onChange={(e) => field.onChange(maskCPF(e.target.value))}
                          />
                        </FormControl>
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Campo Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="seu.email@exemplo.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando solicitação...
                    </>
                  ) : (
                    "Solicitar Senha"
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Link para voltar ao Login */}
          <div className="text-center pt-2">
            <Button
              variant="link"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-primary transition-smooth"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EsqueciSenha;
