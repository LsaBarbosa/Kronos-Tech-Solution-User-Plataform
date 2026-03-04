import { ChangeEvent, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Shield, Loader2, MapPin, CheckCircle, Clock, CalendarDays } from "lucide-react";
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
import { API_BASE_URL } from "@/config/api";
import { Label } from "@/components/ui/label";
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

// --- ESQUEMAS DE VALIDAÇÃO REVISADOS ---

// Esquema para validação rigorosa dos campos do Passo 1 (Employee)
// O campo homeOffice é adicionado como uma string (necessário para o Select)
const employeeSchema = z.object({
    nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    cpf: z.string().length(14, "CPF deve ter 11 dígitos"), 
    cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    salario: z.string().min(1, "Salário é obrigatório"),
    telefone: z.string().length(15, "Telefone deve ter 11 dígitos"), 
    cep: z.string().length(9, "CEP deve ter 8 dígitos"), 
    numero: z.string().min(1, "Número é obrigatório"),
    faceImageBase64: z.string().optional(),
    homeOffice: z.enum(["true", "false"], { // NOVO CAMPO
        required_error: "O status Home Office é obrigatório.",
    }),
    workStartTime: z.string().min(1, "Início da jornada obrigatório"),
    workEndTime: z.string().min(1, "Fim da jornada obrigatório"),
    breakStartTime: z.string().min(1, "Início do intervalo obrigatório"),
    breakEndTime: z.string().min(1, "Fim do intervalo obrigatório"),
    scheduleType: z.string().min(1, "Tipo de escala é obrigatório"),

    scaleStartDate: z.string().optional(), // Data YYYY-MM-DD
    preferredDayOff: z.string().optional(),
    weekendOffIndex: z.string().optional(), // Vem como string do Select, converteremos para number no submit
    fixedWorkDays: z.array(z.string()).optional()
});

// Esquema para validação rigorosa dos campos do Passo 2 (User)
const userSchema = z.object({
    username: z.string().min(4, "Usuário deve ter pelo menos 4 caracteres"),
    role: z.enum(["MANAGER", "PARTNER"]),
});

// Esquema de Formulário Completo (Usado no useForm)
// Tornamos os campos do Passo 2 opcionais/default para que o form.handleSubmit não falhe no Passo 1
const formSchema = employeeSchema.extend({
    username: z.string().optional(),
    role: z.enum(["MANAGER", "PARTNER"]).optional(),
});

// Tipagem unificada para o formulário
type FormData = z.infer<typeof employeeSchema> & z.infer<typeof userSchema>;

const CriarColaborador = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
    // Estados para controle de fluxo
    const [savedEmployeeId, setSavedEmployeeId] = useState<string | null>(null);
    const [stepCompleted, setStepCompleted] = useState(false); 
    
    // Estados para verificação de username
    const [usernameAvailability, setUsernameAvailability] = useState<'available' | 'unavailable' | 'checking' | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
const [faceImageBase64, setFaceImageBase64] = useState<string | undefined>(undefined);
    
    // NOVO ESTADO: Armazenar o nome do arquivo selecionado para exibir no input
    const [fileName, setFileName] = useState<string | undefined>(undefined);

    // NOVA FUNÇÃO: Manipular o upload do arquivo de imagem e converter para Base64
    const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                // A string Base64 completa, incluindo o prefixo (e.g., "data:image/jpeg;base64,")
                const base64String = reader.result as string; 
                // Remove o prefixo para enviar apenas a string Base64 pura para o backend
                const base64Data = base64String.split(',')[1];
                setFaceImageBase64(base64Data);
            };
            reader.readAsDataURL(file);
        } else {
            setFileName(undefined);
            setFaceImageBase64(undefined);
        }
    }, []);
    const form = useForm<FormData>({
        // O resolver usa o formSchema com os campos de usuário opcionais
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
            homeOffice: "false", // NOVO VALOR PADRÃO
            workStartTime: "08:00",
            workEndTime: "17:00",
            breakStartTime: "12:00",
            breakEndTime: "13:00",
            scheduleType: "TRADITIONAL_5X2",
            fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
            username: "",
            role: "PARTNER",
            
        },
    });
         const selectedScheduleType = form.watch("scheduleType")
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
        // Usamos o userSchema para validar o campo username separadamente.
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

        // Lógica de chamada à API para verificação (Mantida)
        try {

            const response = await fetch(`${API_BASE_URL}users/check-username?username=${username}`, {
                credentials: "include",
                headers: {  },
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
        
        // 💡 CORREÇÃO APLICADA: Validação explícita dos campos do Passo 1 (Employee)
        const employeeValidation = employeeSchema.safeParse(data);
        if (!employeeValidation.success) {
            // Se falhar, as mensagens de erro do RHF já aparecerão no formulário.
            toast({
                title: "Erro de validação",
                description: "Preencha corretamente os Dados do Colaborador (Passo 1).",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        
        try {

            // Removendo máscaras e convertendo dados para envio ao backend
            const employeePayload = {
                fullName: data.nomeCompleto,
                cpf: data.cpf.replace(/\D/g, ""),
                jobPosition: data.cargo,
                email: data.email,
                // Garantimos que o salário seja enviado como float/number
                salary: parseFloat(data.salario.replace(/[R$\s.]/g, "").replace(",", ".")), 
                phone: data.telefone.replace(/\D/g, ""),
                homeOffice: data.homeOffice === "true", // NOVO CAMPO: Converte string para boolean

                faceImageBase64: faceImageBase64,
                address: {
                    postalCode: data.cep.replace(/\D/g, ""),
                    number: data.numero,
                },
                workStartTime: data.workStartTime, 
                workEndTime: data.workEndTime,
                breakStartTime: data.breakStartTime,
                breakEndTime: data.breakEndTime,

                scheduleType: data.scheduleType,
                scaleStartDate: data.scaleStartDate || null,
                preferredDayOff: data.preferredDayOff || null,
                weekendOffIndex: data.weekendOffIndex ? parseInt(data.weekendOffIndex) : null,
                fixedWorkDays: data.fixedWorkDays || []
            };

            const employeeResponse = await fetch(`${API_BASE_URL}employee`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json",  },
                body: JSON.stringify(employeePayload),
            });

            if (!employeeResponse.ok) {
                const errorData = await employeeResponse.json();
                throw new Error(errorData.detail || errorData.message || "Desculpe. Verifique o campo CPF e tente novamente!");
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
        
        // 💡 CORREÇÃO APLICADA: Validação explícita dos campos do Passo 2 (User)
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

        // Validação da checagem do username (mantida e necessária para o Passo 2)
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

            // Aqui, usamos data.username, data.password e data.role que foram validados pelo userSchema
            const userPayload = {
                username: data.username,
                role: data.role,
                employeeId: savedEmployeeId, // Usa o ID salvo do Passo 1
            };

            const userResponse = await fetch(`${API_BASE_URL}users`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json",  },
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
        // Se o Passo 1 não foi completado, tenta criar o Employee.
        if (!stepCompleted) {
            // A validação completa é ignorada graças ao formSchema modificado,
            // e a validação real do Passo 1 ocorre dentro de handleCreateEmployee.
            handleCreateEmployee(data);
        } else {
            // Se o Passo 1 foi completado, tenta criar o User.
            handleCreateUser(data);
        }
    };

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

       
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6 pt-20">
                <div className="w-full max-w-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                            Criar Colaborador
                        </h1>
                        <p className="text-muted-foreground">
                            {stepCompleted ? "Credenciais de Acesso" : "Dados Pessoais e Profissionais"}
                        </p>
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
                                        
                                        <FormField control={form.control} name="nomeCompleto" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Nome Completo</FormLabel>
                                                <FormControl><Input placeholder="Digite o nome completo" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="cpf" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">CPF</FormLabel>
                                                <FormControl><Input placeholder="000.000.000-00" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCPF(e.target.value))} maxLength={14} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="cargo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Cargo</FormLabel>
                                                <FormControl><Input placeholder="Ex: Padeiro, Atendente" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="email@exemplo.com" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="salario" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Salário</FormLabel>
                                                <FormControl><Input placeholder="R$ 0,00" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCurrency(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="telefone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Telefone</FormLabel>
                                                <FormControl><Input placeholder="(00) 00000-0000" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} maxLength={15} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-6">
                                        <FormField control={form.control} name="cep" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> CEP</FormLabel>
                                                <FormControl><Input placeholder="00000-000" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCEP(e.target.value))} maxLength={9} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="numero" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Número</FormLabel>
                                                <FormControl><Input placeholder="Ex: 123, 45A" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        
                                        {/* NOVO CAMPO: HOME OFFICE */}
                                        <FormField control={form.control} name="homeOffice" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Trabalho Remoto (Home Office)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="O colaborador trabalha remotamente?" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="false">Não (Exige Geolocalização)</SelectItem>
                                                        <SelectItem value="true">Sim (Ignora Geolocalização)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        {/* FIM NOVO CAMPO */}
                                    </div>

{/* --- NOVA SEÇÃO: CONFIGURAÇÃO DE ESCALA --- */}
                                    <div className="md:col-span-2 mt-6 mb-4 border-t pt-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
                                            <CalendarDays className="h-5 w-5" /> Configuração de Escala
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Tipo de Escala */}
                                            <FormField control={form.control} name="scheduleType" render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Tipo de Escala</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione a escala" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {SCHEDULE_TYPES.map(type => (
                                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>

                                            {/* Datas e Folgas Condicionais */}
                                            {(selectedScheduleType === "ROTATING_12X36" || selectedScheduleType === "ROTATING_24X72" || selectedScheduleType?.includes("SIX_BY_ONE")) && (
                                                <FormField control={form.control} name="scaleStartDate" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Data Início Ciclo</FormLabel>
                                                        <FormControl><Input type="date" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                            )}

                                            {selectedScheduleType?.includes("SIX_BY_ONE") && (
                                                <FormField control={form.control} name="preferredDayOff" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Folga Fixa na Semana</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {DAYS_OF_WEEK.map(day => (
                                                                    <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                            )}

                                            {selectedScheduleType === "SIX_BY_ONE_ONE_WEEKEND" && (
                                                <FormField control={form.control} name="weekendOffIndex" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Índice do Fim de Semana</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Qual semana?" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="1">1º Final de Semana</SelectItem>
                                                                <SelectItem value="2">2º Final de Semana</SelectItem>
                                                                <SelectItem value="3">3º Final de Semana</SelectItem>
                                                                <SelectItem value="4">4º Final de Semana</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                            )}
                                        </div>

                                        {/* Dias Fixos (Tradicional) */}
                                        {selectedScheduleType === "TRADITIONAL_5X2" && (
                                            <FormField control={form.control} name="fixedWorkDays" render={() => (
                                                <FormItem className="mt-4">
                                                    <FormLabel className="mb-2 block">Dias de Trabalho (Fixo)</FormLabel>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                        {DAYS_OF_WEEK.map((day) => (
                                                            <FormField key={day.value} control={form.control} name="fixedWorkDays" render={({ field }) => {
                                                                return (
                                                                    <FormItem key={day.value} className="flex items-center space-x-2 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(day.value)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...(field.value || []), day.value])
                                                                                        : field.onChange(field.value?.filter((value) => value !== day.value));
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer text-sm">{day.label}</FormLabel>
                                                                    </FormItem>
                                                                );
                                                            }} />
                                                        ))}
                                                    </div>
                                                </FormItem>
                                            )}/>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2 mt-4 mb-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                                        <Clock className="h-5 w-5" /> Jornada de Trabalho
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Defina o horário contratual para o cálculo do ponto.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField control={form.control} name="workStartTime" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Entrada</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="breakStartTime" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Saída Intervalo</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="breakEndTime" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Volta Intervalo</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="workEndTime" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Saída</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="faceImage">Imagem Facial (Opcional)</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input 
                                                id="faceImage"
                                                type="file" 
                                                accept="image/jpeg, image/png"
                                                onChange={handleImageUpload} 
                                                className="flex-1 hidden" // Esconde o input file padrão
                                            />
                                            <label htmlFor="faceImage" className="cursor-pointer flex-1 flex items-center justify-between p-2 h-10 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground">
                                                <span className="truncate text-sm text-gray-500">
                                                    {fileName || "Clique para selecionar a imagem (.jpg, .png)"}
                                                </span>
                                                <span className="text-gray-400">📁</span>
                                            </label>
                                            {faceImageBase64 && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Recomendado para uso do ponto facial.</p>
                                    </div>

                                    
                                    {/* Botão de Submissão do Passo 1 */}
                                    {!stepCompleted && (
                                        <Button
                                            type="submit"
                                            variant="default"
                                            size="lg"
                                            className="w-full h-14 text-lg font-semibold mt-6 shadow-md"
                                            // Botão agora depende APENAS do estado de submissão.
                                            disabled={isSubmitting} 
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
                                        )}/>
                                        
                                      
                            

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
                                        )}/>
                                    </div>

                                    {/* Botão de Submissão do Passo 2 (Final) */}
                                    {stepCompleted && (
                                        <div className="pt-6">
                                            <Button
                                                type="submit"
                                                variant="login"
                                                size="lg"
                                                className="w-full h-14 text-lg font-semibold shadow-button hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                                // Botão Final agora exige tanto a submissão, quanto a checagem de username
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
        </div>
    );
};

export default CriarColaborador;
