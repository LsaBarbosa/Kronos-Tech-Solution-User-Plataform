import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Certifique-se de que este caminho está correto para o seu projeto
import { API_BASE_URL } from "@/config/api"; 

// --- 1. SCHEMAS E TIPAGEM ---
const formSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(14, "CPF deve ter 11 dígitos (incluindo máscara)"),
  cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  salario: z.string().min(1, "O salário é obrigatório"),
  telefone: z.string().min(15, "Telefone inválido"), // (99) 99999-9999
  cep: z.string().min(9, "CEP inválido"), // 99999-999
  numero: z.string().min(1, "O número é obrigatório"),
  
  // Campos de Usuário
  username: z.string().min(4, "Nome de usuário deve ter pelo menos 4 caracteres").max(20),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["PARTNER", "MANAGER"], {
    required_error: "O perfil é obrigatório.",
  }),
});

type FormData = z.infer<typeof formSchema>;


// --- 2. FUNÇÕES DE MÁSCARA ---
const maskCpf = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
};

const maskPhone = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/(\d{2})(\d)/, "($1) $2");
  value = value.replace(/(\d)(\d{4})$/, "$1-$2");
  return value.slice(0, 15);
};

const maskCEP = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/(\d{5})(\d)/, "$1-$2");
  return value.slice(0, 9);
};

const maskCurrency = (value: string) => {
  value = value.replace(/[\D]+/g, '');
  if (value.length === 0) return '';

  let integerPart = value.substring(0, value.length - 2);
  let decimalPart = value.substring(value.length - 2);

  integerPart = integerPart.replace(/^0+/, '');
  if (integerPart.length === 0) integerPart = '0';

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `R$ ${integerPart},${decimalPart}`;
};


// --- 3. COMPONENTE PRINCIPAL ---
const CriarColaborador = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // NOVO ESTADO CHAVE: Controla a transição das etapas
  const [createdEmployeeId, setCreatedEmployeeId] = useState<string | null>(null);
  
  // Estados para a checagem de username
  const [usernameAvailability, setUsernameAvailability] = useState<'available' | 'unavailable' | 'checking' | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

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
    mode: "onSubmit" 
  });


  // --- 4. LÓGICA DE VERIFICAÇÃO DE USUÁRIO ---
  const handleCheckUsername = async () => {
    const username = form.getValues('username');
    
    if (form.getFieldState('username').invalid || username.length < 4) {
      form.trigger('username');
      toast({ title: "Atenção", description: "Nome de usuário deve ter pelo menos 4 caracteres.", variant: "default" });
      return;
    }
    
    setIsCheckingUsername(true);
    setUsernameAvailability('checking');

    try {
      const response = await fetch(`${API_BASE_URL}users/check-username/${username}`);
      
      if (response.ok) {
        setUsernameAvailability('available');
        toast({ title: "Sucesso", description: "Nome de usuário disponível.", className: "bg-green-100 text-green-700" });
      } else {
        // Assume que a verificação que retorna status 200 para disponível é a única
        setUsernameAvailability('unavailable');
        
        let errorDetail = "Nome de usuário já em uso ou erro na checagem.";
        try {
            const errorData = await response.json();
            if (errorData && errorData.detail) {
                errorDetail = errorData.detail;
            }
        } catch (e) {
            // Se falhar ao parsear JSON, usa a mensagem padrão
        }

        toast({ title: "Erro", description: errorDetail, variant: "destructive" });
      }
    } catch (error) {
      setUsernameAvailability('unavailable');
      toast({ title: "Erro de Conexão", description: "Não foi possível verificar o nome de usuário.", variant: "destructive" });
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // --- 5. FUNÇÃO DE CRIAÇÃO DO COLABORADOR (PASSO 1) ---
  const handleCreateEmployee = async (data: FormData) => {
    setIsSubmitting(true);

    const employeeFields: Array<keyof FormData> = ['nomeCompleto', 'cpf', 'cargo', 'email', 'salario', 'telefone', 'cep', 'numero'];
    const validEmployeeData = await form.trigger(employeeFields as any);

    if (!validEmployeeData) {
        toast({
            title: "Erro de Validação",
            description: "Preencha corretamente todos os dados do Colaborador antes de prosseguir.",
            variant: "destructive",
        });
        setIsSubmitting(false);
        return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado. Faça login novamente.");

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

      const employeeResponse = await fetch(`${API_BASE_URL}employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(employeePayload),
      });

      if (!employeeResponse.ok) {
          let errorMessage = "Falha ao criar o colaborador (Erro de rede ou servidor).";
          try {
              // Tenta ler a mensagem detalhada do backend no formato esperado
              const errorData = await employeeResponse.json();
              if (errorData && errorData.detail) {
                  errorMessage = errorData.detail; // Usa a mensagem do backend
              } else if (errorData && errorData.message) {
                  errorMessage = errorData.message; // Fallback para um formato mais comum
              }
          } catch (e) {
              // Se falhar ao parsear o JSON, usa a mensagem padrão
          }
          throw new Error(errorMessage);
      }
      
      const employeeData = await employeeResponse.json();
      const employeeId = employeeData.employeeId;

      setCreatedEmployeeId(employeeId);
      
      toast({
        title: "Colaborador Criado!",
        description: "Prossiga para a Etapa 2: Cadastro do Usuário.",
      });
      
      document.getElementById('user-section')?.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      // Exibe a mensagem capturada do backend ou a mensagem de erro padrão
      toast({
        title: "Erro na Criação do Colaborador",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 6. FUNÇÃO DE CRIAÇÃO DO USUÁRIO (PASSO 2) ---
  const handleCreateUser = async (data: FormData) => {
    if (!createdEmployeeId) {
        toast({ title: "Erro de Fluxo", description: "Colaborador deve ser criado primeiro.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);

    try {
        if (usernameAvailability !== 'available') {
            toast({
                title: "Erro de Validação",
                description: "O nome de usuário precisa ser verificado e estar disponível.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        const userFields: Array<keyof FormData> = ['username', 'password', 'role'];
        const validUserData = await form.trigger(userFields as any);

        if (!validUserData) {
            toast({
                title: "Erro de Validação",
                description: "Preencha corretamente todos os dados do Usuário.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");

        const userPayload = {
            username: data.username,
            password: data.password,
            role: data.role,
            employeeId: createdEmployeeId, // Usa o ID do colaborador gerado
        };

        const userResponse = await fetch(`${API_BASE_URL}users`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(userPayload),
        });

        if (!userResponse.ok) {
            let errorMessage = "Falha ao criar o usuário (Erro de rede ou servidor).";
            try {
                // Tenta ler a mensagem detalhada do backend no formato esperado
                const errorData = await userResponse.json();
                if (errorData && errorData.detail) {
                    errorMessage = errorData.detail; // Usa a mensagem do backend
                } else if (errorData && errorData.message) {
                    errorMessage = errorData.message; // Fallback para um formato mais comum
                }
            } catch (e) {
                // Se falhar ao parsear o JSON, usa a mensagem padrão
            }
            throw new Error(errorMessage);
        }

        toast({
            title: "Registro Completo!",
            description: `Usuário ${data.username} criado e vinculado a ${data.nomeCompleto}.`,
        });

        form.reset();
        setCreatedEmployeeId(null); 
        setUsernameAvailability(null);
        navigate("/dashboard");

    } catch (error) {
        // Exibe a mensagem capturada do backend ou a mensagem de erro padrão
        toast({
            title: "Erro na Criação do Usuário",
            description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  // --- 7. RENDERIZAÇÃO (JSX) ---
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="rounded-full h-10 w-10 text-primary hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Cadastro de Colaborador
              </h1>
              <p className="text-sm text-muted-foreground">
                Processo em duas etapas: Colaborador → Usuário.
              </p>
            </div>
          </div>

          <Card className="border-l-4 border-l-primary shadow-card">
            <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold text-primary">Novo Registro</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                    {createdEmployeeId 
                        ? "Etapa 2: Finalize a criação do usuário de acesso." 
                        : "Etapa 1: Preencha os dados pessoais do colaborador."
                    }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  {/* Define a função de submissão baseada no estado: Passo 1 ou Passo 2 */}
                  <form 
                    onSubmit={form.handleSubmit(createdEmployeeId ? handleCreateUser : handleCreateEmployee)} 
                    className="space-y-6"
                  >

                    {/* ---------------------------------------------------- */}
                    {/* --- SEÇÃO 1: DADOS DO COLABORADOR --- */}
                    {/* ---------------------------------------------------- */}
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-primary">1. Informações Pessoais</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                          {/* Campo: Nome Completo */}
                          <FormField control={form.control} name="nomeCompleto" render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                  <FormLabel className="text-base font-semibold">Nome Completo</FormLabel>
                                  <FormControl>
                                      <Input
                                          placeholder="Digite o nome completo"
                                          className="h-12 text-base"
                                          {...field}
                                          // DESABILITADO após a primeira etapa
                                          disabled={!!createdEmployeeId || isSubmitting}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Campo: CPF */}
                          <FormField control={form.control} name="cpf" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold">CPF</FormLabel>
                                  <FormControl>
                                      <Input
                                          placeholder="000.000.000-00"
                                          className="h-12 text-base"
                                          {...field}
                                          onChange={(e) => field.onChange(maskCpf(e.target.value))}
                                          disabled={!!createdEmployeeId || isSubmitting}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Campo: Cargo */}
                          <FormField control={form.control} name="cargo" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold">Cargo</FormLabel>
                                  <FormControl>
                                      <Input
                                          placeholder="Ex: Desenvolvedor"
                                          className="h-12 text-base"
                                          {...field}
                                          disabled={!!createdEmployeeId || isSubmitting}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Campo: Email */}
                          <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold">Email</FormLabel>
                                  <FormControl>
                                      <Input
                                          placeholder="exemplo@empresa.com"
                                          className="h-12 text-base"
                                          {...field}
                                          disabled={!!createdEmployeeId || isSubmitting}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Campo: Salário */}
                          <FormField control={form.control} name="salario" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold">Salário Base</FormLabel>
                                  <FormControl>
                                      <Input
                                          placeholder="R$ 0,00"
                                          className="h-12 text-base"
                                          {...field}
                                          onChange={(e) => field.onChange(maskCurrency(e.target.value))}
                                          disabled={!!createdEmployeeId || isSubmitting}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Campo: Telefone */}
                          <FormField control={form.control} name="telefone" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold">Telefone</FormLabel>
                                  <FormControl>
                                      <Input
                                          placeholder="(99) 99999-9999"
                                          className="h-12 text-base"
                                          {...field}
                                          onChange={(e) => field.onChange(maskPhone(e.target.value))}
                                          disabled={!!createdEmployeeId || isSubmitting}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Campo: CEP */}
                          <FormField control={form.control} name="cep" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold">CEP</FormLabel>
                                  <FormControl>
                                      <Input
                                          placeholder="00000-000"
                                          className="h-12 text-base"
                                          {...field}
                                          onChange={(e) => field.onChange(maskCEP(e.target.value))}
                                          disabled={!!createdEmployeeId || isSubmitting}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Campo: Número */}
                          <FormField control={form.control} name="numero" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold">Número</FormLabel>
                                  <FormControl>
                                      <Input
                                          placeholder="Nº da residência/apto"
                                          className="h-12 text-base"
                                          type="number"
                                          {...field}
                                          onChange={(e) => field.onChange(e.target.value)}
                                          disabled={!!createdEmployeeId || isSubmitting}
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Mensagem de Sucesso da Etapa 1 */}
                          {createdEmployeeId && (
                              <div className="md:col-span-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                  <span className="text-sm font-medium text-green-700">
                                      Colaborador criado com sucesso! Prossiga para a etapa 2 abaixo.
                                  </span>
                              </div>
                          )}

                          {/* BOTÃO DA ETAPA 1: CRIAR COLABORADOR (só se não houver ID) */}
                          {!createdEmployeeId && (
                              <div className="md:col-span-2 pt-4">
                                  <Button
                                      type="submit" 
                                      variant="default"
                                      size="lg"
                                      className="w-full h-14 text-lg font-semibold shadow-button transition-all duration-300"
                                      disabled={isSubmitting}
                                  >
                                      {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Criar Colaborador e Continuar"}
                                  </Button>
                              </div>
                          )}
                      </div>
                    </div>


                    {/* ---------------------------------------------------- */}
                    {/* --- SEÇÃO 2: DADOS DO USUÁRIO (CONDICIONAL) --- */}
                    {/* ---------------------------------------------------- */}

                    <div id="user-section" className={`space-y-4 pt-8 transition-opacity duration-500 ${createdEmployeeId ? 'opacity-100 block' : 'opacity-50 pointer-events-none'}`}>
                      <h3 className="text-xl font-semibold text-primary">2. Informações de Usuário</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Campo: Nome de Usuário */}
                          <FormField control={form.control} name="username" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold flex items-center">
                                      Nome de Usuário
                                  </FormLabel>
                                  <div className="flex space-x-2">
                                      <FormControl>
                                          <Input
                                              placeholder="Digite o nome de usuário"
                                              className="h-12 text-base"
                                              {...field}
                                              onChange={(e) => {
                                                  field.onChange(e);
                                                  setUsernameAvailability(null); // Reseta a verificação ao digitar
                                              }}
                                              disabled={!createdEmployeeId || isSubmitting} 
                                          />
                                      </FormControl>
                                      <Button
                                          type="button"
                                          onClick={handleCheckUsername}
                                          disabled={!createdEmployeeId || isCheckingUsername || form.formState.errors.username?.type === 'min' || isSubmitting}
                                          className="touch-target w-auto h-12"
                                      >
                                          {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
                                      </Button>
                                  </div>
                                  <FormMessage>
                                      {usernameAvailability === 'unavailable' && 'Nome de usuário já existe.'}
                                      {usernameAvailability === 'available' && <span className="text-green-500">Nome de usuário disponível.</span>}
                                  </FormMessage>
                              </FormItem>
                          )} />
                          
                          {/* Campo: Senha */}
                          <FormField control={form.control} name="password" render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-base font-semibold">Senha</FormLabel>
                                  <FormControl>
                                      <Input
                                          type="password"
                                          placeholder="Digite a senha"
                                          className="h-12 text-base"
                                          {...field}
                                          disabled={!createdEmployeeId || isSubmitting} 
                                      />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {/* Campo: Perfil (Role) */}
                          <FormField control={form.control} name="role" render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                  <FormLabel className="text-base font-semibold">Perfil</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          )} />
                      </div>
                          
                          {/* BOTÃO DA ETAPA 2: CRIAR USUÁRIO (só se houver ID) */}
                          {createdEmployeeId && (
                              <div className="pt-4 md:col-span-2">
                                  <Button
                                      type="submit" 
                                      variant="login"
                                      size="lg"
                                      className="w-full h-14 text-lg font-semibold shadow-button hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                      // Condição de habilitação: Não submetendo E username disponível
                                      disabled={isSubmitting || usernameAvailability !== 'available'}
                                  >
                                      {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Criar Usuário"}
                                  </Button>
                              </div>
                          )}

                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CriarColaborador;