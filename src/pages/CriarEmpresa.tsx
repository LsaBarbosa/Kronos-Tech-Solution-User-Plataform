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
import { ArrowLeft, Building2, Save, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { checkCnpjExists, createCompany } from "@/service/adminPortal.service";

// NOVO: Variável de ambiente para o HERE API Key
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
    const [isGeocoding, setIsGeocoding] = useState(false);

    // --- NOVOS ESTADOS PARA VERIFICAÇÃO DE CNPJ ---
    const [cnpjAvailability, setCnpjAvailability] = useState<'available' | 'unavailable' | 'checking' | null>(null);
    const [isCheckingCNPJ, setIsCheckingCNPJ] = useState(false);
    // ----------------------------------------------

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
        },
    });

    // Watch fields
    const cep = form.watch("address.postalCode");
    const numero = form.watch("address.number");
    const currentLatitude = form.watch("location.latitude");
    const currentCNPJ = form.watch("cnpj");

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
            // 1. Busca Endereço completo pelo ViaCEP
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


    // Efeito para disparar a geocodificação automaticamente
    useEffect(() => {
        const isAddressReady = cep.replace(/\D/g, '').length === 8 && numero.length > 0;
        const isGeocodingNeeded = isAddressReady && !isGeocoding && currentLatitude === undefined;

        if (isGeocodingNeeded) {
            handleGeocodeAddress(cep.replace(/\D/g, ''), numero);
        }
    }, [cep, numero, isGeocoding, currentLatitude, handleGeocodeAddress]); 

    // ===============================================
    // 📝 FUNÇÃO DE CHECAGEM DE CNPJ (NOVA)
    // ===============================================
    const handleCheckCNPJ = useCallback(async (cnpjValue: string) => {
        const cnpj = cnpjValue.replace(/\D/g, '');

        if (cnpj.length !== 14) {
            toast({
                title: "Erro de validação",
                description: "O CNPJ deve ter 14 dígitos.",
                variant: "destructive",
            });
            setCnpjAvailability(null);
            return;
        }

        setIsCheckingCNPJ(true);
        setCnpjAvailability('checking');

        try {

            // Chamada à API para verificação de CNPJ
            const exists = await checkCnpjExists(cnpj);

            if (exists) {
                // Status 200/OK: CNPJ existe (indisponível)
                toast({ title: "CNPJ indisponível", description: "Este CNPJ já está cadastrado no sistema.", variant: "destructive" });
                setCnpjAvailability('unavailable');
            } else {
                // Status 404: CNPJ não existe (disponível)
                toast({ title: "CNPJ disponível!", description: "Você pode usar este CNPJ para o registro." });
                setCnpjAvailability('available');
            }
        } catch (error) {
            console.error("Erro na comunicação com a API:", error);
            toast({ title: "Erro de rede", description: "Falha ao conectar com o servidor.", variant: "destructive" });
            setCnpjAvailability(null);
        } finally {
            setIsCheckingCNPJ(false);
        }
    }, [toast]);
    // ===============================================


    // ===============================================
    // 💾 LÓGICA DE SUBMISSÃO (ATUALIZADA)
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

        // --- NOVA VALIDAÇÃO: CNPJ CHECK ---
        if (cnpjAvailability !== 'available') {
            toast({
                title: "Ação Pendente",
                description: "É necessário verificar a disponibilidade do CNPJ antes de cadastrar a empresa.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        // ---------------------------------

        try {
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
            };

            // 3. Chamada da API para CRIAR A EMPRESA
            await createCompany(companyPayload);

        // *****************************************************************
        // CORREÇÃO: Sucesso com status 2xx (e corpo vazio). 
        // Removemos a chamada a companyResponse.json().
        // *****************************************************************

        // 4. SUCESSO e REDIRECIONAMENTO para a próxima etapa
        toast({
            title: "Empresa Criada com Sucesso!",
            description: `Agora, crie o primeiro Administrador da ${values.name}.`,
        });

        form.reset();
        setCnpjAvailability(null); // Limpa o status do CNPJ no reset
        
        // Usamos o CNPJ no path, já que o ID não é retornado pelo backend (método void).
        const companyCnpjForNextStep = values.cnpj.replace(/\D/g, '');
        
        navigate("/criar-administrador");

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

 const handleToggleSidebar = () => setSidebarOpen((prev) => !prev); 
  return (
     <div className="min-h-screen bg-background relative  overflow-hidden">
      {/* Animated Background and Header/Sidebar components */}
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
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float-shapes 20s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.50), transparent)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float-shapes 25s ease-in-out infinite reverse'
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '50%',
              animation: 'float-shapes 18s ease-in-out infinite 5s'
            }}
          />
        </div>
      </div>

    <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />

      <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
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

                                        {/* CAMPO CNPJ (ATUALIZADO COM VERIFICAÇÃO) */}
                                        <FormField
                                            control={form.control}
                                            name="cnpj"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-foreground font-medium">CNPJ</FormLabel>
                                                    <div className="flex space-x-2">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="12345678000123"
                                                                maxLength={14}
                                                                className="border-border focus:border-primary focus:ring-primary/20"
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value.replace(/\D/g, ''));
                                                                    setCnpjAvailability(null); // Resetar status ao digitar
                                                                }}
                                                                value={field.value}
                                                            />
                                                        </FormControl>
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleCheckCNPJ(field.value)}
                                                            // Desabilita se estiver checando ou se o campo não estiver completo (14 dígitos)
                                                            disabled={isCheckingCNPJ || field.value.length !== 14}
                                                            className="touch-target w-auto"
                                                        >
                                                            {isCheckingCNPJ ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
                                                        </Button>
                                                    </div>
                                                    <FormDescription>
                                                        CNPJ da empresa (apenas números)
                                                    </FormDescription>
                                                    <FormMessage>
                                                        {/* Mensagens de status do CNPJ */}
                                                        {cnpjAvailability === 'unavailable' && <span className="text-red-500">CNPJ já existe no sistema.</span>}
                                                        {cnpjAvailability === 'available' && <span className="text-green-500">CNPJ disponível para cadastro.</span>}
                                                    </FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                        {/* FIM: CNPJ ATUALIZADO */}
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

                            {/* Botões de Ação */}
                            <div className="flex gap-4 pt-6">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
                                    // Desabilita se estiver enviando, geocodificando OU se o CNPJ não estiver verificado/disponível
                                    disabled={isSubmitting || isGeocoding || cnpjAvailability !== 'available'}
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
                                        // Garante que as coordenadas e o CNPJ sejam limpos ao resetar
                                        form.setValue("location.latitude", undefined);
                                        form.setValue("location.longitude", undefined);
                                        setCnpjAvailability(null);
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
        </div>
    );
};

export default CriarEmpresa;
