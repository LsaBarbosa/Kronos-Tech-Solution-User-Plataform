import { useState, useCallback, useEffect } from "react";
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
// Select, SelectContent, SelectItem, SelectTrigger, SelectValue REMOVIDOS (porque não há mais campo Role/Usuário)
import { ArrowLeft, Building2, Save, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

// NOVO: Variável de ambiente para o HERE API Key
//const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;
const HERE_API_KEY = "4BOpnro1zHzBBh9olurKhD4aWIw9I-gcY6VRox9wSXU";

// Schema de validação (AGORA SÓ COM DADOS DA EMPRESA)
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
});

const CriarEmpresa = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  // usernameAvailability, isCheckingUsername, savedEmployeeId, step1Completed, step2Completed REMOVIDOS
  const [isGeocoding, setIsGeocoding] = useState(false);

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
      // employeeRequest e userRequest REMOVIDOS dos defaultValues
    },
  });

  // Watch fields para o Geocoding
  const cep = form.watch("address.postalCode");
  const numero = form.watch("address.number");
  const currentLatitude = form.watch("location.latitude");

  // handleCheckUsername REMOVIDA

  // ===============================================
  // 📍 LÓGICA DE GEOLOCALIZAÇÃO AUTOMÁTICA (MANTIDA)
  // ===============================================
  const handleGeocodeAddress = useCallback(async (postalCode: string, number: string) => {
    if (postalCode.length !== 8 || number.length < 1) return;

    if (!HERE_API_KEY) {
      toast({
          title: "Erro de Configuração",
          description: "A chave VITE_HERE_API_KEY não foi definida.",
          variant: "destructive",
      });
      return;
    }

    setIsGeocoding(true);
    form.setValue("location.latitude", undefined);
    form.setValue("location.longitude", undefined);

    try {
        // 1. Busca Endereço completo pelo ViaCEP (MANTIDO)
        const cepResponse = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`);
        const cepData = await cepResponse.json();

        if (cepData.erro) {
            throw new Error("CEP não encontrado ou inválido.");
        }

        // Monta o endereço completo
        const fullAddress = `${cepData.logradouro}, ${number}, ${cepData.localidade}, ${cepData.uf}, Brasil`;

        // 2. Geocodificação pelo HERE Maps API
        const geocodeResponse = await fetch(
            `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${HERE_API_KEY}&in=countryCode:BRA`,
        );

        const geocodeData = await geocodeResponse.json();

        if (!geocodeResponse.ok || geocodeData.items.length === 0) {
            throw new Error(`Erro na API HERE: ${geocodeData.error || "Localização não encontrada."}`);
        }
        
        const position = geocodeData.items[0].position;
        const lat = position.lat;
        const lon = position.lng;

        // 3. Atualiza os campos do formulário
        form.setValue("location.latitude", lat);
        form.setValue("location.longitude", lon);

        toast({
            title: "Localização Capturada",
            description: `Coordenadas obtidas com sucesso.`,
        });

    } catch (error: any) {
        console.error("Erro na geocodificação:", error);
        toast({
            title: "Erro na Geolocalização",
            description: error.message || "Falha ao consultar a API de localização.",
            variant: "destructive",
        });
        form.setValue("location.latitude", undefined);
        form.setValue("location.longitude", undefined);
    } finally {
        setIsGeocoding(false);
    }
  }, [form, toast]);


  // Efeito para disparar a geocodificação automaticamente (MANTIDO)
  useEffect(() => {
    const isAddressReady = cep.replace(/\D/g, '').length === 8 && numero.length > 0;
    const isGeocodingNeeded = isAddressReady && !isGeocoding && currentLatitude === undefined;

    if (isGeocodingNeeded) {
        handleGeocodeAddress(cep.replace(/\D/g, ''), numero);
    }
  }, [cep, numero, isGeocoding, currentLatitude, handleGeocodeAddress]); 

  // ===============================================
  // 💾 LÓGICA DE SUBMISSÃO (SIMPLIFICADA)
  // ===============================================
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // 1. Validação da Geolocalização
    if (values.location.latitude === undefined || values.location.longitude === undefined) {
      toast({
        title: "Erro de Validação",
        description: "Aguarde a geolocalização automática ser concluída (Latitude/Longitude).",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Sessão Expirada",
          description: "O token de autenticação não foi encontrado. Faça login novamente.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // 2. Monta o Payload APENAS com os dados da Empresa
      const companyPayload = {
        name: values.name,
        cnpj: values.cnpj.replace(/\D/g, ''), // Limpeza de CNPJ
        email: values.email,
        address: {
          ...values.address,
          postalCode: values.address.postalCode.replace(/\D/g, ''), // Limpeza de CEP
        },
        location: values.location,
        // employeeRequest e userRequest REMOVIDOS do payload
      };

      // 3. Chamada da API para CRIAR A EMPRESA
      const companyResponse = await fetch(`${API_BASE_URL}companies`, { // Ajuste o endpoint se for necessário
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(companyPayload),
      });

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json();
        throw new Error(errorData.detail || "Erro ao criar empresa.");
      }

      const companyData = await companyResponse.json();
      const newCompanyId = companyData.id; // Supondo que a API retorne o ID da nova empresa

      // 4. SUCESSO e REDIRECIONAMENTO para a próxima etapa
      toast({
        title: "Empresa Criada com Sucesso!",
        description: `Agora, crie o primeiro Administrador da ${values.name}.`,
      });

      form.reset();
      
      // Redireciona para a nova tela/fluxo de criação de usuário/admin
      // Passamos o ID da empresa como state/parametro para a proxima tela
      navigate(`/criar-administrador/${newCompanyId}`, { state: { companyName: values.name } });

    } catch (error: any) {
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

  // ===============================================
  // 🎨 RENDERIZAÇÃO (REMOÇÃO DOS CAMPOS DE FUNCIONÁRIO/USUÁRIO)
  // ===============================================
  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Criar Empresa
              </h1>
              <p className="text-muted-foreground">
                Cadastre as informações básicas da nova empresa.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Dados da Empresa (MANTIDO) */}
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
                    {/* CAMPO NOME */}
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

                    {/* CAMPO CNPJ */}
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
                              // Limpeza para garantir apenas números
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                              value={field.value}
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

                  {/* CAMPO EMAIL */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Email Corporativo</FormLabel>
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

                  {/* CAMPOS DE ENDEREÇO E COORDENADAS (MANTIDOS) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CEP */}
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
                              onChange={(e) => {
                                field.onChange(e.target.value.replace(/\D/g, '').slice(0, 8));
                                // Limpa coordenadas se o CEP for alterado
                                form.setValue("location.latitude", undefined);
                                form.setValue("location.longitude", undefined);
                              }}
                              value={field.value}
                            />
                          </FormControl>
                          <FormDescription>
                            CEP do endereço (apenas números)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* NÚMERO */}
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
                               // Limpa coordenadas se o Número for alterado
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                form.setValue("location.latitude", undefined);
                                form.setValue("location.longitude", undefined);
                              }}
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
                  {/* Campos de Latitude/Longitude (automáticos) */}
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location.latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Latitude
                            {isGeocoding && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              disabled
                              placeholder={isGeocoding ? "Buscando..." : "Preenchimento automático"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location.longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Longitude
                            {isGeocoding && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              disabled
                              placeholder={isGeocoding ? "Buscando..." : "Preenchimento automático"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormDescription>
                      As coordenadas de latitude e longitude são preenchidas automaticamente ao informar o CEP e o Número.
                  </FormDescription>
                  {/* FIM Campos de Latitude/Longitude */}
                </CardContent>
              </Card>

              {/* Dados do Funcionário e Dados do Usuário REMOVIDOS COMPLETAMENTE DO JSX */}

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
                  // Desabilita se estiver enviando ou se estiver geocodificando
                  disabled={isSubmitting || isGeocoding}
                >
                  {isSubmitting
                    ? "Criando Empresa..."
                    : isGeocoding
                    ? "Aguarde Geocodificação..."
                    : "Criar Empresa"
                  }
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-border hover:bg-muted"
                  onClick={() => {
                      form.reset();
                      // Garante que as coordenadas sejam limpas ao resetar
                      form.setValue("location.latitude", undefined);
                      form.setValue("location.longitude", undefined);
                  }}
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