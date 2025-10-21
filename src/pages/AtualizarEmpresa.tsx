import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Save, MapPin, Mail, Loader2, Hash, LocateFixed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

const HERE_API_KEY = "4BOpnro1zHzBBh9olurKhD4aWIw9I-gcY6VRox9wSXU";

// --- INTERFACES DE DADOS ---

interface CompanyListItem {
    id: string; // UUID
    name: string;
    cnpj: string;
    email: string;
    active: boolean;
}

interface Location {
    latitude: number | null;
    longitude: number | null;
}

// Estrutura de dados detalhada da API /companies/{cnpj} (Assumida)
interface CompanyData extends CompanyListItem {
    address: {
        street: string;
        number: string;
        postalCode: string; // 8 dígitos
        city: string;
        state: string;
    };
    location: Location; // Campo agora obrigatório
}

// =========================================================================================
// ✅ NOVO: FUNÇÃO REAL DE GEOCÓDIGO (ADAPTADA DE CriarEmpresa.tsx)
// =========================================================================================
const getGeolocationFromCEP = async (cep: string, number: string): Promise<Location> => {
    
    if (!HERE_API_KEY) {
        throw new Error("A chave HERE_API_KEY não foi definida. Verifique o arquivo.");
    }

    try {
        // 1. Busca Endereço completo pelo ViaCEP
        const cepResponse = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const cepData = await cepResponse.json();

        if (cepData.erro) {
            throw new Error("CEP não encontrado ou inválido pelo ViaCEP.");
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
        
        return {
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lon.toFixed(6))
        };

    } catch (error: any) {
        // Propaga o erro para ser tratado no handleGeocode
        throw new Error(error.message || "Falha ao obter coordenadas geográficas.");
    }
};
// =========================================================================================


// --- SCHEMAS DE VALIDAÇÃO ---

const formSchema = z.object({
    selectedCnpj: z.string().min(1, { message: "Selecione uma empresa para editar." }),
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
    email: z.string().email({ message: "Email inválido." }),
    active: z.string(), 
    address: z.object({
        postalCode: z.string().length(8, { message: "CEP deve ter 8 dígitos (somente números)." }),
        number: z.string().min(1, { message: "Número é obrigatório." }),
    }),
    // NOVOS CAMPOS: Mantidos ocultos e usados apenas para controle no submit
    latitude: z.number().nullable().optional(), 
    longitude: z.number().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AtualizarEmpresa = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companies, setCompanies] = useState<CompanyListItem[]>([]);
    const [isFetchingCompanies, setIsFetchingCompanies] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [originalCompany, setOriginalCompany] = useState<CompanyData | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            selectedCnpj: "",
            name: "",
            email: "",
            active: "true",
            address: {
                postalCode: "",
                number: "",
            },
            latitude: null, // Valor inicial
            longitude: null, // Valor inicial
        },
    });
    
    const selectedCnpj = form.watch("selectedCnpj");
    const watchedPostalCode = form.watch("address.postalCode");
    const watchedNumber = form.watch("address.number");

    // --- MÁSCARAS E FORMATADORES ---
    const formatCNPJ = (cnpj: string) => cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    const cleanCEP = (cep: string) => cep.replace(/\D/g, '').slice(0, 8);


    // --- FUNÇÕES DE BUSCA ---

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            throw new Error("Token de autenticação não encontrado.");
        }
        return { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
    }, [navigate]);

    const fetchCompanyList = useCallback(async () => {
        setIsFetchingCompanies(true);
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}companies`, { headers });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Falha ao buscar a lista de empresas.");
            }
            const data = await response.json();
            setCompanies(data.companies);
        } catch (error: any) {
            console.error("Erro ao buscar empresas:", error);
            toast({ title: "Erro", description: error.message || "Não foi possível carregar a lista de empresas.", variant: "destructive" });
        } finally {
            setIsFetchingCompanies(false);
        }
    }, [getAuthHeaders, toast]);

    const fetchCompanyDetails = useCallback(async (cnpj: string) => {
        if (!cnpj) return;

        setIsLoadingDetails(true);
        setOriginalCompany(null);
        
        try {
            const headers = getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}companies/${cnpj}`, { headers });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Empresa não encontrada ou falha ao carregar detalhes.");
            }
            
            const data: CompanyData = await response.json();
            setOriginalCompany(data);
            
            // Popula o formulário com os dados da empresa e a localização
            form.reset({
                selectedCnpj: cnpj,
                name: data.name,
                email: data.email,
                active: String(data.active),
                address: {
                    postalCode: data.address.postalCode, 
                    number: data.address.number,
                },
                latitude: data.location?.latitude, // NOVO: Carrega Lat/Lon original
                longitude: data.location?.longitude, // NOVO: Carrega Lat/Lon original
            });

            toast({ title: "Dados carregados", description: `Detalhes de ${data.name} preenchidos no formulário.` });
        } catch (error: any) {
            console.error("Erro ao buscar detalhes da empresa:", error);
            toast({ title: "Erro", description: error.message || "Não foi possível carregar os detalhes da empresa.", variant: "destructive" });
            form.reset({ selectedCnpj: cnpj }); 
        } finally {
            setIsLoadingDetails(false);
        }
    }, [getAuthHeaders, toast, form]);
    
    // --- FUNÇÃO DE GEOCÓDIGO CONDICIONAL (AGORA USA A LÓGICA REAL) ---
    const handleGeocode = useCallback(async () => {
        const cep = cleanCEP(watchedPostalCode);
        const number = watchedNumber;
        
        // Verifica se originalCompany existe e se os campos de endereço estão válidos
        if (!originalCompany || cep.length !== 8 || number.length < 1) {
            // Se não estiver pronto ou sem empresa selecionada, mantém o Lat/Lon original
            form.setValue("latitude", originalCompany?.location.latitude || null);
            form.setValue("longitude", originalCompany?.location.longitude || null);
            return;
        }
        
        // Verifica se o endereço realmente mudou para evitar geocoding desnecessário
        const cepChanged = cep !== originalCompany.address.postalCode;
        const numberChanged = number !== originalCompany.address.number;
        
        if (cepChanged || numberChanged) {
             setIsGeocoding(true);
             // Limpa os valores enquanto busca
             form.setValue("latitude", null);
             form.setValue("longitude", null);

             try {
                // ✅ Chamada à função REAL de geocodificação
                const newLocation = await getGeolocationFromCEP(cep, number);
                
                form.setValue("latitude", newLocation.latitude);
                form.setValue("longitude", newLocation.longitude);
                toast({ title: "Geolocalização atualizada", description: "Novas coordenadas obtidas com sucesso." });
             } catch (error: any) {
                console.error("Erro de Geocodificação:", error);
                toast({ title: "Erro de Geocodificação", description: error.message || "Não foi possível obter as coordenadas. Verifique o CEP/Número.", variant: "destructive" });
                // Em caso de falha, resetamos para NULL para forçar o usuário a corrigir
                form.setValue("latitude", null); 
                form.setValue("longitude", null);
             } finally {
                setIsGeocoding(false);
             }
        }
        
    }, [watchedPostalCode, watchedNumber, originalCompany, form, toast]);


    // EFEITO DE INICIALIZAÇÃO
    useEffect(() => {
        fetchCompanyList();
    }, [fetchCompanyList]);

    // EFEITO DE SELEÇÃO DE EMPRESA
    useEffect(() => {
        if (selectedCnpj && selectedCnpj !== originalCompany?.cnpj && !isLoadingDetails) {
            fetchCompanyDetails(selectedCnpj);
        }
    }, [selectedCnpj, originalCompany, isLoadingDetails, fetchCompanyDetails]);

    // EFEITO DE MUDANÇA DE ENDEREÇO (GATILHO PARA GEOCÓDIGO)
    useEffect(() => {
        // Dispara o geocoding se houver uma empresa original carregada E os campos estiverem completos
        if (originalCompany && cleanCEP(watchedPostalCode).length === 8 && watchedNumber.length >= 1) {
            handleGeocode();
        }
    }, [watchedPostalCode, watchedNumber, originalCompany, handleGeocode]);


    // --- FUNÇÃO DE SUBMISSÃO (PATCH) ---
    async function onSubmit(values: FormData) {
        if (!originalCompany) return;
        
        // Finalização das validações (Verifica se Lat/Lon existem se o endereço mudou)
        const isAddressChanged = cleanCEP(values.address.postalCode) !== originalCompany.address.postalCode ||
                                values.address.number !== originalCompany.address.number;

        if (isAddressChanged && (values.latitude === null || values.longitude === null)) {
            toast({ 
                title: "Ação Necessária", 
                description: "O endereço foi alterado, mas as coordenadas geográficas (Latitude/Longitude) não puderam ser obtidas. Por favor, corrija o CEP/Número.", 
                variant: "destructive" 
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const headers = getAuthHeaders();
            
            // Verifica se a localização realmente precisa ser enviada. 
            // Se o endereço mudou, usa a nova Lat/Lon. Se não mudou, usa a original.
            let finalLocation: Location = originalCompany.location;
            if(isAddressChanged && values.latitude !== null && values.longitude !== null) {
                finalLocation = {
                    latitude: values.latitude,
                    longitude: values.longitude,
                };
            }
            
            // Payload de atualização
            const updatePayload: any = {
                name: values.name,
                email: values.email,
                active: values.active === "true",
                address: {
                    // Garante que o endereço é enviado no formato limpo para a API
                    postalCode: cleanCEP(values.address.postalCode), 
                    number: values.address.number,
                },
                location: finalLocation
            };

            const response = await fetch(`${API_BASE_URL}companies/${originalCompany.cnpj}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify(updatePayload),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Falha ao atualizar empresa.");
            }

            toast({
                title: "Sucesso!",
                description: `A empresa ${values.name} foi atualizada.`,
            });
            
            // Reseta para a próxima edição
            await fetchCompanyList(); 
            form.reset({ selectedCnpj: "" });
            setOriginalCompany(null);
            
        } catch (error: any) {
            console.error("Erro no processo de atualização:", error);
            toast({
                title: "Erro ao atualizar empresa",
                description: error.message || "Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
 const handleToggleSidebar = () => setSidebarOpen((prev) => !prev); 
  return (
    <div className="flex h-screen bg-background">
      {/* 💡 CORREÇÃO: Sidebar usa 'toggleSidebar' */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} /> 
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />

            <main className="pt-16 px-4 md:px-6">
                <div className="max-w-4xl mx-auto py-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/empresa")} aria-label="Voltar">
                            <ArrowLeft className="h-6 w-6 text-foreground" />
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                                Atualizar Dados da Empresa
                            </h1>
                            <p className="text-muted-foreground">
                                Selecione uma empresa para editar suas informações e status.
                            </p>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            
                            {/* CARD DE SELEÇÃO */}
                            <Card className="border-l-4 border-l-secondary shadow-card">
                                <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <Hash className="h-6 w-6 text-secondary" />
                                        <div>
                                            <CardTitle className="text-xl text-foreground">1. Selecionar Empresa</CardTitle>
                                            <CardDescription className="text-muted-foreground">
                                                Escolha qual empresa você deseja editar
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="selectedCnpj"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">Empresa</FormLabel>
                                                <Select 
                                                    onValueChange={field.onChange} 
                                                    value={field.value}
                                                    disabled={isFetchingCompanies || isLoadingDetails}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="border-border focus:border-primary focus:ring-primary/20">
                                                            <SelectValue placeholder={isFetchingCompanies ? "Carregando lista..." : "Selecione a empresa pelo nome"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {companies.map((company) => (
                                                            <SelectItem key={company.id} value={company.cnpj}>
                                                                {company.name} ({formatCNPJ(company.cnpj)})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {isLoadingDetails && (
                                        <div className="flex items-center gap-2 text-primary">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Carregando dados da empresa...</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CARD DE EDIÇÃO */}
                            <Card className={`border-l-4 border-l-primary shadow-card ${!originalCompany || isLoadingDetails ? 'opacity-50 pointer-events-none' : ''}`}>
                                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-6 w-6 text-primary" />
                                        <div>
                                            <CardTitle className="text-xl text-foreground">2. Editar Dados</CardTitle>
                                            <CardDescription className="text-muted-foreground">
                                                Altere as informações da empresa selecionada.
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
                                                        <Input placeholder="Nome da empresa" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* CNPJ (apenas visualização) */}
                                        <FormItem>
                                            <FormLabel className="text-foreground font-medium">CNPJ (Visualização)</FormLabel>
                                            <Input 
                                                value={originalCompany ? formatCNPJ(originalCompany.cnpj) : ''} 
                                                disabled 
                                                placeholder="CNPJ"
                                            />
                                            <FormDescription>CNPJ não pode ser editado.</FormDescription>
                                        </FormItem>
                                        
                                        {/* CAMPO EMAIL */}
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-foreground font-medium flex items-center gap-2">
                                                        <Mail className="h-4 w-4" /> Email Corporativo
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="contato@empresa.com" type="email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* ENDEREÇO E STATUS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                        {/* CEP */}
                                        <FormField
                                            control={form.control}
                                            name="address.postalCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-foreground font-medium flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" /> CEP
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="12345678"
                                                            maxLength={8}
                                                            {...field}
                                                            onChange={(e) => field.onChange(cleanCEP(e.target.value))}
                                                            value={field.value.replace(/[^0-9]/g, '')} // Garante que o input só mostre números
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                    <FormDescription>Atualize o CEP (8 dígitos).</FormDescription>
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
                                                        <Input placeholder="123" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        {/* STATUS GEOLOCALIZAÇÃO */}
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="text-foreground font-medium flex items-center gap-2">
                                                <LocateFixed className="h-4 w-4" /> Status Geolocalização
                                            </FormLabel>
                                            {isGeocoding ? (
                                                <div className="flex items-center gap-2 text-yellow-600">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Recalculando coordenadas...</span>
                                                </div>
                                            ) : form.getValues('latitude') !== null && form.getValues('longitude') !== null ? (
                                                <div className="text-green-600">
                                                    Coordenadas obtidas: **Lat: {form.getValues('latitude')}, Lon: {form.getValues('longitude')}**
                                                </div>
                                            ) : (
                                                <div className="text-red-600">
                                                    Atenção: Coordenadas pendentes ou inválidas.
                                                </div>
                                            )}
                                            <FormDescription>As coordenadas são essenciais para a marcação de ponto.</FormDescription>
                                            {/* Campos ocultos para Lat/Lon */}
                                            <FormField control={form.control} name="latitude" render={() => <Input type="hidden" />} />
                                            <FormField control={form.control} name="longitude" render={() => <Input type="hidden" />} />
                                        </FormItem>
                                        
                                        {/* STATUS (ACTIVE) */}
                                        <FormField
                                            control={form.control}
                                            name="active"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-foreground font-medium">Status da Empresa</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="true">Ativa</SelectItem>
                                                            <SelectItem value="false">Inativa</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    {/* Botões de Ação */}
                                    <div className="flex justify-end gap-4 pt-6 border-t border-border">
                                        <Button
                                            type="submit"
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
                                            // Desabilita se estiver enviando, carregando detalhes, geocodificando OU se Lat/Lon for NULL (coordenadas pendentes/inválidas)
                                            disabled={isSubmitting || isLoadingDetails || isGeocoding || !originalCompany || form.getValues('latitude') === null}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5 mr-2" />
                                                    Salvar Alterações
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-border hover:bg-muted"
                                            onClick={() => {
                                                form.reset({ selectedCnpj: "" });
                                                setOriginalCompany(null);
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </Form>
                </div>
            </main>
        </div>
        </div>
    );
};

export default AtualizarEmpresa;