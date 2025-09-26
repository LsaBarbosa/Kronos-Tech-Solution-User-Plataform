import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Building2, Save, User, Shield, Loader2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

// Lembre-se de configurar esta variável no seu arquivo .env.local
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Schema de validação que corresponde exatamente ao DTO do backend
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  cnpj: z.string().length(14, {
    message: "CNPJ deve ter 14 caracteres.",
  }),
  email: z.string().email({
    message: "Email deve ser válido.",
  }),
  address: z.object({
    postalCode: z.string().length(8, {
      message: "CEP deve ter 8 caracteres.",
    }),
    number: z.string().min(1, {
      message: "Número é obrigatório.",
    }),
  }),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  employeeRequest: z.object({
    fullName: z.string().min(2, {
      message: "Nome completo deve ter pelo menos 2 caracteres.",
    }),
    cpf: z.string().length(11, {
      message: "CPF deve ter 11 dígitos.",
    }),
    jobPosition: z.string().min(2, {
      message: "Cargo deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
      message: "Email deve ser válido.",
    }),
    salary: z.number().min(0, {
      message: "Salário deve ser um valor positivo.",
    }),
    phone: z.string().min(10, {
      message: "Telefone deve ter pelo menos 10 dígitos.",
    }),
    address: z.object({
      postalCode: z.string().length(8, {
        message: "CEP deve ter 8 caracteres.",
      }),
      number: z.string().min(1, {
        message: "Número é obrigatório.",
      }),
    }),
  }),
  userRequest: z.object({
    username: z.string().min(3, {
      message: "Nome de usuário deve ter pelo menos 3 caracteres.",
    }),
    password: z.string().min(6, {
      message: "Senha deve ter pelo menos 6 caracteres.",
    }),
    role: z.enum(["MANAGER", "PARTNER"]),
  }),
});

const CriarEmpresa = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [usernameAvailability, setUsernameAvailability] = useState<
    "available" | "unavailable" | "checking" | null
  >(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isFetchingCoords, setIsFetchingCoords] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      email: "",
      address: {
        postalCode: "",
        number: "",
      },
      location: {
        latitude: undefined,
        longitude: undefined,
      },
      employeeRequest: {
        fullName: "",
        cpf: "",
        jobPosition: "",
        email: "",
        salary: 0,
        phone: "",
        address: {
          postalCode: "",
          number: "",
        },
      },
      userRequest: {
        username: "",
        password: "",
        role: "MANAGER" as const,
      },
    },
  });

  const getCoordinates = useCallback(async () => {
    const postalCode = form.getValues("address.postalCode");
    const number = form.getValues("address.number");

    if (!GOOGLE_MAPS_API_KEY) {
      toast({
        title: "Configuração Incompleta",
        description: "A chave da API do Google Maps não foi configurada.",
        variant: "destructive",
      });
      return;
    }

    if (postalCode.length !== 8 || !number) {
      toast({
        title: "Dados incompletos",
        description: "Forneça um CEP válido e o número para buscar as coordenadas.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingCoords(true);
    try {
      const cepResponse = await fetch(
        `https://viacep.com.br/ws/${postalCode}/json/`
      );
      if (!cepResponse.ok) throw new Error("CEP não encontrado.");
      const cepData = await cepResponse.json();
      if (cepData.erro) throw new Error("CEP inválido.");

      const { logradouro } = cepData;
      const addressString = `${logradouro}, ${number}`;
      const components = `postal_code:${postalCode}|country:BR`;

      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          addressString
        )}&components=${encodeURIComponent(components)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const geoData = await geoResponse.json();

      if (geoData.status === "OK") {
        const location = geoData.results[0].geometry.location;
        form.setValue("location.latitude", location.lat);
        form.setValue("location.longitude", location.lng);
        toast({
          title: "Coordenadas obtidas!",
          description: "Latitude e longitude preenchidas com sucesso.",
        });
      } else {
        if (geoData.status === "ZERO_RESULTS") {
            throw new Error("Não foi possível encontrar as coordenadas. Verifique o CEP e o número.");
        }
        throw new Error(geoData.error_message || "Ocorreu um erro ao buscar as coordenadas.");
      }
    } catch (error) {
      toast({
        title: "Erro na Geolocalização",
        description: error.message,
        variant: "destructive",
      });
      form.setValue("location.latitude", undefined);
      form.setValue("location.longitude", undefined);
    } finally {
      setIsFetchingCoords(false);
    }
  }, [form, toast]);


  const handleCheckUsername = async () => {
    const username = form.getValues("userRequest.username");
    if (!username || username.length < 4) {
      toast({
        title: "Erro de validação",
        description: "O nome de usuário deve ter pelo menos 4 caracteres.",
        variant: "destructive",
      });
      setUsernameAvailability(null);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameAvailability("checking");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const response = await fetch(
        `${API_BASE_URL}users/check-username?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast({
          title: "Nome de usuário indisponível",
          description: "Este nome de usuário já está em uso. Por favor, escolha outro.",
          variant: "destructive",
        });
        setUsernameAvailability("unavailable");
      } else if (response.status === 404) {
        toast({
          title: "Nome de usuário disponível!",
          description: "Você pode usar este nome de usuário para o registro.",
        });
        setUsernameAvailability("available");
      } else {
        toast({
          title: "Erro na verificação",
          description:
            "Ocorreu um erro ao verificar o nome de usuário. Tente novamente.",
          variant: "destructive",
        });
        setUsernameAvailability(null);
      }
    } catch (error) {
      console.error("Erro na comunicação com a API:", error);
      toast({
        title: "Erro de rede",
        description: "Falha ao conectar com o servidor. Verifique sua conexão.",
        variant: "destructive",
      });
      setUsernameAvailability(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    if (usernameAvailability !== "available") {
      toast({
        title: "Erro de validação",
        description:
          "Por favor, verifique a disponibilidade do nome de usuário antes de registrar.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Erro de autenticação",
          description: "Token não encontrado. Faça login novamente.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const companyPayload = {
        name: values.name,
        cnpj: values.cnpj,
        email: values.email,
        address: values.address,
        employeeRequest: values.employeeRequest,
        location: values.location,
      };

      const companyResponse = await fetch(`${API_BASE_URL}companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(companyPayload),
      });

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json();
        throw new Error(errorData.message || "Erro ao criar empresa.");
      }

      const companyData = await companyResponse.json();
      const employeeId = companyData.employeeId;

      const userPayload = {
        username: values.userRequest.username,
        password: values.userRequest.password,
        role: values.userRequest.role,
        employeeId: employeeId,
      };

      const userResponse = await fetch(`${API_BASE_URL}users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userPayload),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || "Erro ao criar usuário.");
      }

      toast({
        title: "Empresa e usuário criados com sucesso!",
        description: `A empresa ${values.name} foi cadastrada no sistema.`,
      });

      form.reset();
    } catch (error) {
      console.error("Erro no processo de criação da empresa:", error);
      toast({
        title: "Erro ao cadastrar empresa",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
          
            <div>
             <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Criar Empresa
              </h1>
              <p className="text-muted-foreground">
                Cadastre uma nova empresa no sistema
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Dados da Empresa */}
              <Card className="border-l-4 border-l-primary shadow-card">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Dados da Empresa</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Informações principais da empresa
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome da empresa"
                              className="border-border focus:border-primary focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Razão social ou nome fantasia da empresa
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">CNPJ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="12345678000123"
                              maxLength={14}
                              className="border-border focus:border-primary focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            CNPJ da empresa (apenas números)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="contato@empresa.com"
                            type="email"
                            className="border-border focus:border-primary focus:ring-primary/20"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Email principal da empresa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">CEP</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="12345678"
                              maxLength={8}
                              className="border-border focus:border-primary focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            CEP do endereço (apenas números)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Número</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123"
                              className="border-border focus:border-primary focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Número do endereço
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="grid grid-cols-2 gap-6 flex-grow">
                      <FormField
                        control={form.control}
                        name="location.latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Latitude</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Automático"
                                value={field.value || ""}
                                disabled
                                className="bg-muted/50"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location.longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Longitude</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Automático"
                                value={field.value || ""}
                                disabled
                                className="bg-muted/50"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={getCoordinates}
                      disabled={isFetchingCoords}
                      variant="outline"
                      className="h-10"
                    >
                      {isFetchingCoords ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Buscar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Dados do Funcionário */}
              <Card className="border-l-4 border-l-accent shadow-card">
                <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <User className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Dados do Funcionário</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Informações pessoais e profissionais
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="employeeRequest.fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Nome Completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome completo"
                              className="border-border focus:border-accent focus:ring-accent/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Nome completo do funcionário
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeRequest.cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">CPF</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="12345678901"
                              maxLength={11}
                              className="border-border focus:border-accent focus:ring-accent/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            CPF do funcionário (apenas números)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeRequest.jobPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Cargo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o cargo"
                              className="border-border focus:border-accent focus:ring-accent/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Cargo do funcionário na empresa
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeRequest.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="funcionario@email.com"
                              type="email"
                              className="border-border focus:border-accent focus:ring-accent/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Email do funcionário
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeRequest.salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Salário</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="0"
                              type="number"
                              className="border-border focus:border-accent focus:ring-accent/20"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Salário do funcionário
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeRequest.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="11987654321"
                              className="border-border focus:border-accent focus:ring-accent/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Telefone do funcionário
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                    <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-accent" />
                      Endereço do Funcionário
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employeeRequest.address.postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">CEP</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="12345678"
                                maxLength={8}
                                className="border-border focus:border-accent focus:ring-accent/20"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              CEP do endereço (apenas números)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employeeRequest.address.number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Número</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                className="border-border focus:border-accent focus:ring-accent/20"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Número do endereço
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados do Usuário */}
             <Card className="border-l-4 border-l-primary shadow-card">
                <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <Shield className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Dados do Usuário</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Credenciais de acesso ao sistema
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="userRequest.username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Nome de Usuário</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input
                                placeholder="Digite o nome de usuário"
                                className="border-border focus:border-secondary focus:ring-secondary/20"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setUsernameAvailability(null);
                                }}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={handleCheckUsername}
                              disabled={
                                isCheckingUsername || field.value.length < 4
                              }
                              className="touch-target w-auto h-12"
                            >
                              {isCheckingUsername ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Verificar"
                              )}
                            </Button>
                          </div>
                          <FormMessage>
                            {usernameAvailability === "unavailable" &&
                              "Nome de usuário já existe."}
                            {usernameAvailability === "available" && (
                              <span className="text-green-500">
                                Nome de usuário disponível.
                              </span>
                            )}
                          </FormMessage>
                          <FormDescription>
                            Nome de usuário para acesso ao sistema
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="userRequest.password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Senha</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite a senha"
                              type="password"
                              className="border-border focus:border-secondary focus:ring-secondary/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Senha de acesso (mínimo 6 caracteres)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="userRequest.role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Cargo no Sistema</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-border focus:border-secondary focus:ring-secondary/20">
                              <SelectValue placeholder="Selecione o cargo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border-border z-50">
                            <SelectItem value="MANAGER">Administrador</SelectItem>
                            <SelectItem value="PARTNER">Colaborador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Nível de acesso no sistema
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
                  disabled={isSubmitting || usernameAvailability !== "available"}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Criando Empresa..." : "Criar Empresa"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-border hover:bg-muted"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default CriarEmpresa;