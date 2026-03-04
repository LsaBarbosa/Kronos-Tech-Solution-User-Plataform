import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Shield, Loader2, MapPin, CheckCircle, Building2, CalendarDays } from "lucide-react";
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
import { API_BASE_URL, apiFetch } from "@/config/api";
import { Checkbox } from "@/components/ui/checkbox";

const SCHEDULE_TYPES = [
    { value: "TRADITIONAL_5X2", label: "Tradicional 5x2 (Seg-Sex)" },
    { value: "SIX_BY_ONE_FIXED", label: "6x1 com Folga Fixa" },
    { value: "ROTATING_12X36", label: "Plantão 12x36" },
    { value: "ROTATING_24X72", label: "Plantão 24x72" },
    { value: "SIX_BY_ONE_TWO_WEEKENDS", label: "6x1 + 2 Finais de Semana" },
    { value: "SIX_BY_ONE_ONE_WEEKEND", label: "6x1 + 1 Final de Semana" }
];

const DAYS_OF_WEEK = [
    { value: "MONDAY", label: "Segunda-feira" },
    { value: "TUESDAY", label: "Terça-feira" },
    { value: "WEDNESDAY", label: "Quarta-feira" },
    { value: "THURSDAY", label: "Quinta-feira" },
    { value: "FRIDAY", label: "Sexta-feira" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" }
];

// --- NOVAS INTERFACES ---
interface Company {
    companyId: string; // Agora armazena o UUID (campo 'id' da API)
    name: string;
}

// --- ESQUEMAS DE VALIDAÇÃO REVISADOS ---

// Esquema para validação rigorosa dos campos do Passo 1 (Employee)
const employeeSchema = z.object({
    companyId: z.string().min(1, "Selecione a empresa do colaborador"),
    nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    cpf: z.string().length(14, "CPF deve ter 11 dígitos"),
    cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    salario: z.string().min(1, "Salário é obrigatório"),
    telefone: z.string().length(15, "Telefone deve ter 11 dígitos"),
    cep: z.string().length(9, "CEP deve ter 8 dígitos"),
    numero: z.string().min(1, "Número é obrigatório"),
    scheduleType: z.string().min(1, "Tipo de escala é obrigatório"),
    scaleStartDate: z.string().optional(),
    preferredDayOff: z.string().optional(),
    weekendOffIndex: z.string().optional(),
    fixedWorkDays: z.array(z.string()).optional()
});

// Esquema para validação rigorosa dos campos do Passo 2 (User)
const userSchema = z.object({
    username: z.string().min(4, "Usuário deve ter pelo menos 4 caracteres"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    role: z.enum(["MANAGER", "PARTNER"]),
});

// Esquema de Formulário Completo (Usado no useForm)
const formSchema = employeeSchema.extend({
    username: z.string().optional(),
    password: z.string().optional(),
    role: z.enum(["MANAGER", "PARTNER"]).optional(),
});

// Tipagem unificada para o formulário
type FormData = z.infer<typeof employeeSchema> & z.infer<typeof userSchema>;

const CriarManager = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
    // --- ESTADOS PARA EMPRESAS ---
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isFetchingCompanies, setIsFetchingCompanies] = useState(true);
    
    // Estados para controle de fluxo
    const [savedEmployeeId, setSavedEmployeeId] = useState<string | null>(null);
    const [stepCompleted, setStepCompleted] = useState(false);

    // Estados para verificação de username
    const [usernameAvailability, setUsernameAvailability] = useState<'available' | 'unavailable' | 'checking' | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    
    // --- NOVOS ESTADOS PARA VERIFICAÇÃO DE CPF ---
    const [cpfAvailability, setCpfAvailability] = useState<'available' | 'unavailable' | 'checking' | null>(null);
    const [isCheckingCPF, setIsCheckingCPF] = useState(false);
    // ----------------------------------------------


    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyId: "",
            nomeCompleto: "",
            cpf: "",
            cargo: "",
            email: "",
            salario: "",
            telefone: "",
            cep: "",
            numero: "",
            scheduleType: "TRADITIONAL_5X2",
            fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
            username: "",
            password: "",
            role: "PARTNER",
        },
    });

    // --- FUNÇÃO PARA BUSCAR EMPRESAS ---
    const fetchCompanies = useCallback(async () => {
        setIsFetchingCompanies(true);
        try {
            const response = await apiFetch(`${API_BASE_URL}companies`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Falha ao buscar a lista de empresas.");
            }
            
            const data = await response.json();
            // CORREÇÃO: Mapeando 'id' (UUID) da empresa, e não o 'cnpj'.
            setCompanies(data.companies.map((c: any) => ({ companyId: c.id, name: c.name })));
            
        } catch (error) {
            console.error("Erro ao buscar empresas:", error);
            toast({ title: "Erro", description: "Não foi possível carregar a lista de empresas.", variant: "destructive" });
        } finally {
            setIsFetchingCompanies(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);
    // -----------------------------------
const selectedScheduleType = form.watch("scheduleType");

    // --- Mask functions (Mantidas) ---
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
    // -----------------------
    
    // --- FUNÇÃO PARA VERIFICAR CPF (NOVA) ---
    const handleCheckCPF = async () => {
        const cpfWithMask = form.getValues('cpf');
        const cpf = cpfWithMask.replace(/\D/g, "");

        // Validação básica de comprimento sem a máscara (11 dígitos)
        if (cpf.length !== 11) {
            toast({
                title: "Erro de validação",
                description: "O CPF deve ter 11 dígitos.",
                variant: "destructive",
            });
            setCpfAvailability(null);
            return;
        }

        setIsCheckingCPF(true);
        setCpfAvailability('checking');

        try {

            // Chamada à API para verificação de CPF
            const response = await apiFetch(`${API_BASE_URL}employee/check-cpf?cpf=${cpf}`, {
                credentials: "include",
            });

            if (response.ok) {
                // Se o status for 200/OK, o CPF existe (indisponível)
                toast({ title: "CPF indisponível", description: "Este CPF já está cadastrado no sistema.", variant: "destructive" });
                setCpfAvailability('unavailable');
            } else if (response.status === 404) {
                // Se o status for 404, o CPF não existe (disponível)
                toast({ title: "CPF disponível!", description: "Você pode usar este CPF para o registro." });
                setCpfAvailability('available');
            } else {
                // Outros erros
                toast({ title: "Erro na verificação", description: "Ocorreu um erro ao verificar o CPF.", variant: "destructive" });
                setCpfAvailability(null);
            }
        } catch (error) {
            console.error("Erro na comunicação com a API:", error);
            toast({ title: "Erro de rede", description: "Falha ao conectar com o servidor.", variant: "destructive" });
            setCpfAvailability(null);
        } finally {
            setIsCheckingCPF(false);
        }
    };
    // ------------------------------------------

    const handleCheckUsername = async () => {
        // Bloqueia se o Passo 1 não estiver completo
        if (!stepCompleted) {
            toast({
                title: "Passo Incompleto",
                description: "Por favor, conclua primeiro o cadastro do Colaborador (Passo 1).",
                variant: "destructive",
            });
            setUsernameAvailability(null);
            return;
        }

        const username = form.getValues('username');
        const usernameValidation = userSchema.pick({ username: true }).safeParse({ username });

        if (!usernameValidation.success) {
            toast({
                title: "Erro de validação",
                description: "O nome de usuário deve ter pelo menos 4 caracteres.",
                variant: "destructive",
            });
            setUsernameAvailability(null);
            return;
        }

        setIsCheckingUsername(true);
        setUsernameAvailability('checking');

        try {

            const response = await apiFetch(`${API_BASE_URL}users/check-username?username=${username}`, {
                credentials: "include",
            });

            if (response.ok) {
                toast({ title: "Nome de usuário indisponível", description: "Este nome de usuário já está em uso.", variant: "destructive" });
                setUsernameAvailability('unavailable');
            } else if (response.status === 404) {
                toast({ title: "Nome de usuário disponível!", description: "Você pode usar este nome de usuário para o registro." });
                setUsernameAvailability('available');
            } else {
                toast({ title: "Erro na verificação", description: "Ocorreu um erro ao verificar o nome de usuário.", variant: "destructive" });
                setUsernameAvailability(null);
            }
        } catch (error) {
            console.error("Erro na comunicação com a API:", error);
            toast({ title: "Erro de rede", description: "Falha ao conectar com o servidor.", variant: "destructive" });
            setUsernameAvailability(null);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const handleCreateEmployee = async (data: FormData) => {
        setIsSubmitting(true);

        const employeeValidation = employeeSchema.safeParse(data);
        if (!employeeValidation.success) {
            toast({
                title: "Erro de validação",
                description: "Preencha corretamente os Dados do Colaborador (Passo 1).",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        
        // --- VALIDAÇÃO DE CHECK NO CPF (NOVA) ---
        if (cpfAvailability !== 'available') {
            toast({
                title: "Ação Pendente",
                description: "É necessário verificar a disponibilidade do CPF antes de continuar.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        // -----------------------------------------

        try {

            // Removendo máscaras para envio ao backend
            const employeePayload = {
                companyId: data.companyId, 
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
                scheduleType: data.scheduleType,
                scaleStartDate: data.scaleStartDate || null,
                preferredDayOff: data.preferredDayOff || null,
                weekendOffIndex: data.weekendOffIndex ? parseInt(data.weekendOffIndex) : null,
                fixedWorkDays: data.fixedWorkDays || []
            };
            

            const employeeResponse = await apiFetch(`${API_BASE_URL}employee`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(employeePayload),
            });

            if (!employeeResponse.ok) {
                const errorData = await employeeResponse.json();
                throw new Error(errorData.detail || errorData.message || "Falha ao criar o colaborador.");
            }

            const employeeData = await employeeResponse.json();
            const employeeId = employeeData.employeeId;

            // SUCESSO DO PASSO 1: Salva o ID e avança o passo
            setSavedEmployeeId(employeeId);
            setStepCompleted(true);

            toast({
                title: "Colaborador criado!",
                description: `O registro de ${data.nomeCompleto} foi salvo. Prossiga para as credenciais de usuário.`,
            });

        } catch (error) {
            console.error("Erro no Passo 1 (Colaborador):", error);
            toast({
                title: "Erro ao cadastrar colaborador",
                description: (error instanceof Error) ? error.message : "Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateUser = async (data: FormData) => {
        setIsSubmitting(true);

        const userValidation = userSchema.safeParse(data);
        if (!userValidation.success) {
            toast({
                title: "Erro de validação",
                description: "Preencha corretamente os Dados de Usuário (Passo 2).",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        // Validação da checagem do username (mantida)
        if (usernameAvailability !== 'available') {
            toast({
                title: "Ação Pendente",
                description: "É necessário verificar a disponibilidade do nome de usuário.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        if (!savedEmployeeId) {
            toast({
                title: "Erro de Fluxo",
                description: "O ID do Colaborador não foi encontrado. Por favor, reinicie o cadastro.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        try {

            const userPayload = {
                username: data.username,
                password: data.password,
                role: data.role,
                employeeId: savedEmployeeId, // Usa o ID salvo do Passo 1
            };

            const userResponse = await apiFetch(`${API_BASE_URL}users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(userPayload),
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                throw new Error(errorData.detail || errorData.message || "Falha ao criar o usuário.");
            }

            // SUCESSO FINAL
            toast({
                title: "Cadastro Concluído!",
                description: `O colaborador e usuário (${data.username}) foram criados com sucesso!`,
            });

            // Reset
            form.reset();
            setSavedEmployeeId(null);
            setStepCompleted(false);
            setUsernameAvailability(null);
            setCpfAvailability(null); // Resetar CPF também

            navigate("/empresa");

        } catch (error) {
            console.error("Erro no Passo 2 (Usuário):", error);
            toast({
                title: "Erro ao criar usuário",
                description: (error instanceof Error) ? error.message : "Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Roteador de submissão
    const onSubmit = (data: FormData) => {
        if (!stepCompleted) {
            handleCreateEmployee(data);
        } else {
            handleCreateUser(data);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background (Mantido) */}
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
 <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6 pt-20">
                <div className="w-full max-w-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                            Criar Novo Administrador
                        </h1>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* CARD 1: DADOS DO COLABORADOR (PASSO 1) */}
                            <Card className={`border-l-4 border-l-primary shadow-2xl bg-card/80 backdrop-blur-sm ${stepCompleted ? 'opacity-50 pointer-events-none' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <User className="h-6 w-6 text-primary" />
                                        <div>
                                            <CardTitle className="text-xl">Dados Pessoais</CardTitle>
                                            <CardDescription>
                                                Informações pessoais e profissionais do colaborador
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* CAMPO: SELEÇÃO DE EMPRESA */}
                                        <FormField
                                            control={form.control}
                                            name="companyId"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                        <Building2 className="h-4 w-4" /> Empresa
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isFetchingCompanies || companies.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 text-base">
                                                                <SelectValue
                                                                    placeholder={isFetchingCompanies ? "Carregando empresas..." : "Selecione a empresa"}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {companies.map((company) => (
                                                                <SelectItem key={company.companyId} value={company.companyId}>
                                                                    {company.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField control={form.control} name="nomeCompleto" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Nome Completo</FormLabel>
                                                <FormControl><Input placeholder="Digite o nome completo" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        
                                        {/* CAMPO: CPF COM VERIFICAÇÃO */}
                                        <FormField control={form.control} name="cpf" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">CPF</FormLabel>
                                                <div className="flex space-x-2">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="000.000.000-00"
                                                            className="h-12 text-base"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(maskCPF(e.target.value));
                                                                setCpfAvailability(null); // Resetar status ao digitar
                                                            }}
                                                            maxLength={14}
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        onClick={handleCheckCPF}
                                                        disabled={isCheckingCPF || field.value.length < 14}
                                                        className="touch-target w-auto h-12"
                                                    >
                                                        {isCheckingCPF ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
                                                    </Button>
                                                </div>
                                                <FormMessage>
                                                    {cpfAvailability === 'unavailable' && 'CPF já existe no sistema.'}
                                                    {cpfAvailability === 'available' && <span className="text-green-500">CPF disponível para cadastro.</span>}
                                                </FormMessage>
                                            </FormItem>
                                        )} />
                                        {/* FIM: CPF COM VERIFICAÇÃO */}

                                        <FormField control={form.control} name="cargo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Cargo</FormLabel>
                                                <FormControl><Input placeholder="Ex: Padeiro, Atendente" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="email@exemplo.com" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="salario" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Salário</FormLabel>
                                                <FormControl><Input placeholder="R$ 0,00" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCurrency(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="telefone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Telefone</FormLabel>
                                                <FormControl><Input placeholder="(00) 00000-0000" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} maxLength={15} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-6">
                                        <FormField control={form.control} name="cep" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> CEP</FormLabel>
                                                <FormControl><Input placeholder="00000-000" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCEP(e.target.value))} maxLength={9} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="numero" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Número</FormLabel>
                                                <FormControl><Input placeholder="Ex: 123, 45A" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
<div className="md:col-span-2 mt-6 mb-4 border-t pt-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
                                                <CalendarDays className="h-5 w-5" /> Configuração de Escala
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField control={form.control} name="scheduleType" render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel>Tipo de Escala</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {SCHEDULE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>

                                                {(selectedScheduleType === "ROTATING_12X36" || selectedScheduleType === "ROTATING_24X72" || selectedScheduleType?.includes("SIX_BY_ONE")) && (
                                                    <FormField control={form.control} name="scaleStartDate" render={({ field }) => (
                                                        <FormItem><FormLabel>Início Ciclo</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                )}

                                                {selectedScheduleType?.includes("SIX_BY_ONE") && (
                                                    <FormField control={form.control} name="preferredDayOff" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Folga Fixa</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Dia" /></SelectTrigger></FormControl>
                                                                <SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                )}

                                                {selectedScheduleType === "SIX_BY_ONE_ONE_WEEKEND" && (
                                                    <FormField control={form.control} name="weekendOffIndex" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Índice FDS</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Qual?" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="1">1º FDS</SelectItem>
                                                                    <SelectItem value="2">2º FDS</SelectItem>
                                                                    <SelectItem value="3">3º FDS</SelectItem>
                                                                    <SelectItem value="4">4º FDS</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                )}
                                            </div>

                                            {selectedScheduleType === "TRADITIONAL_5X2" && (
                                                <FormField control={form.control} name="fixedWorkDays" render={() => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel className="mb-2 block">Dias de Trabalho</FormLabel>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {DAYS_OF_WEEK.map((day) => (
                                                                <FormField key={day.value} control={form.control} name="fixedWorkDays" render={({ field }) => (
                                                                    <FormItem key={day.value} className="flex items-center space-x-2 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(day.value)}
                                                                                onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), day.value]) : field.onChange(field.value?.filter((v) => v !== day.value))}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer text-sm">{day.label.substring(0, 3)}</FormLabel>
                                                                    </FormItem>
                                                                )} />
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}/>
                                            )}
                                        </div>
                                    {/* Botão de Submissão do Passo 1 */}
                                    {!stepCompleted && (
                                        <Button
                                            type="submit"
                                            variant="default"
                                            size="lg"
                                            className="w-full h-14 text-lg font-semibold mt-6 shadow-md"
                                            // Desabilita se estiver submetendo ou se ainda estiver buscando as empresas
                                            disabled={isSubmitting || isFetchingCompanies}
                                        >
                                            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Salvar Dados e Continuar"}
                                        </Button>
                                    )}
                                    {stepCompleted && (
                                        <div className="w-full flex items-center justify-center p-3 bg-green-500/10 text-green-600 rounded-lg mt-6 border border-green-500">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            <span>Passo 1 Concluído! Prossiga abaixo.</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CARD 2: DADOS DO USUÁRIO (PASSO 2 - BLOQUEADO) */}
                            <Card className={`border-l-4 border-l-secondary shadow-2xl bg-card/80 backdrop-blur-sm ${!stepCompleted ? 'opacity-50 pointer-events-none' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-6 w-6 text-secondary" />
                                        <div>
                                            <CardTitle className="text-xl">Credenciais de Acesso</CardTitle>
                                            <CardDescription>
                                                Defina o nome de usuário e a senha de acesso ao sistema
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        <FormField control={form.control} name="username" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold flex items-center">Nome de Usuário</FormLabel>
                                                <div className="flex space-x-2">
                                                    <FormControl><Input placeholder="Digite o nome de usuário" className="h-12 text-base" {...field} onChange={(e) => { field.onChange(e); setUsernameAvailability(null); }} /></FormControl>

                                                    {/* BLOQUEIO DO BOTÃO DE VERIFICAR */}
                                                    <Button
                                                        type="button"
                                                        onClick={handleCheckUsername}
                                                        disabled={isCheckingUsername || field.value.length < 4 || !stepCompleted}
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

                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Senha</FormLabel>
                                                <FormControl><Input type="password" placeholder="Digite a senha" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="role" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Perfil</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!stepCompleted}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Selecione o perfil" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="PARTNER">Colaborador (Acesso Padrão)</SelectItem>
                                                        <SelectItem value="MANAGER">Administrador (Acesso Total)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    {/* Botão de Submissão do Passo 2 (Final) */}
                                    {stepCompleted && (
                                        <div className="pt-6">
                                            <Button
                                                type="submit"
                                                variant="login"
                                                size="lg"
                                                className="w-full h-14 text-lg font-semibold shadow-button hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                                // Botão Final exige submissão, checagem de username e validação de password.
                                                disabled={isSubmitting || usernameAvailability !== 'available'}
                                            >
                                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Concluir Cadastro"}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CriarManager;