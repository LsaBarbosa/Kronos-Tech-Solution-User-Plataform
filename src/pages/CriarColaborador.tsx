import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

// Importações adicionais para o Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form validation schema
const formSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(14, "CPF deve ter 11 dígitos"),
  cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  salario: z.string().min(1, "Salário é obrigatório"),
  telefone: z.string().min(15, "Telefone deve ter 11 dígitos"),
  cep: z.string().min(9, "CEP deve ter 8 dígitos"),
  numero: z.string().min(1, "Número é obrigatório"),
  username: z.string().min(4, "Usuário deve ter pelo menos 4 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["MANAGER", "PARTNER"]),
});

type FormData = z.infer<typeof formSchema>;

const CriarColaborador = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeCompleto: "",
      cpf: "",
      cargo: "",
      email: "",
      salario: "",
      telefone: "",
      cep: "",
      numero: "",
      username: "",
      password: "",
      role: "PARTNER",
    },
  });

  // Mask functions
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const maskCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const maskCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = (parseFloat(numericValue) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return formattedValue;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      // **Passo 1: Chamar o endpoint /api/employee**
      const employeePayload = {
        fullName: data.nomeCompleto,
        cpf: data.cpf.replace(/\D/g, ""),
        jobPosition: data.cargo,
        email: data.email,
        salary: parseFloat(data.salario.replace(/[R$\s.]/g, "").replace(",", ".")),
        phone: data.telefone.replace(/\D/g, ""),
        address: {
          postalCode: data.cep.replace(/\D/g, ""),
          number: data.numero,
        },
      };

      const employeeResponse = await fetch("/api/employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(employeePayload),
      });

      if (!employeeResponse.ok) {
        const errorData = await employeeResponse.json();
        throw new Error(errorData.message || "Falha ao criar o colaborador.");
      }
      
      const employeeData = await employeeResponse.json();
      const employeeId = employeeData.employeeId;

      // **Passo 2: Chamar o endpoint /api/users usando o employeeId**
      const userPayload = {
        username: data.username,
        password: data.password,
        role: data.role,
        employeeId: employeeId,
      };

      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(userPayload),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || "Falha ao criar o usuário.");
      }

      toast({
        title: "Colaborador e usuário criados com sucesso!",
        description: `${data.nomeCompleto} foi registrado no sistema.`,
      });

      // Reset form and navigate
      form.reset();
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      console.error("Erro no processo de registro:", error);
      toast({
        title: "Erro ao cadastrar colaborador",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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

      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
              Criar Colaborador
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados para cadastrar um novo colaborador
            </p>
          </div>

          {/* Form Card */}
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Dados do Colaborador</CardTitle>
              <CardDescription className="text-center">
                Todos os campos são obrigatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campos de Employee */}
                    <FormField
                      control={form.control}
                      name="nomeCompleto"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-semibold">Nome Completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome completo"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">CPF</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              className="h-12 text-base"
                              {...field}
                              onChange={(e) => {
                                const maskedValue = maskCPF(e.target.value);
                                field.onChange(maskedValue);
                              }}
                              maxLength={14}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cargo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Cargo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Padeiro, Atendente"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@exemplo.com"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Salário</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="R$ 0,00"
                              className="h-12 text-base"
                              {...field}
                              onChange={(e) => {
                                const maskedValue = maskCurrency(e.target.value);
                                field.onChange(maskedValue);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              className="h-12 text-base"
                              {...field}
                              onChange={(e) => {
                                const maskedValue = maskPhone(e.target.value);
                                field.onChange(maskedValue);
                              }}
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">CEP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00000-000"
                              className="h-12 text-base"
                              {...field}
                              onChange={(e) => {
                                const maskedValue = maskCEP(e.target.value);
                                field.onChange(maskedValue);
                              }}
                              maxLength={9}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Número</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 123, 45A"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Separador de campos */}
                    <div className="md:col-span-2 border-b border-border my-4" />

                    {/* Campos de User */}
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Nome de Usuário</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome de usuário"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Digite a senha"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-base font-semibold">Perfil</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Selecione o perfil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PARTNER">Colaborador</SelectItem>
                              <SelectItem value="MANAGER">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="login"
                      size="lg"
                      className="w-full h-14 text-lg font-semibold shadow-button hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Registrando..." : "Registrar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CriarColaborador;