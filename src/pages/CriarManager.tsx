import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Shield, Loader2, MapPin, CheckCircle, Building2, Lock } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

// 💡 NOVO: Importa o hook customizado com a lógica de formulário
import { useEmployeeForm } from "@/hooks/useEmployeeForm";
// 💡 NOVO: Importa utilitários e tipos
import { formatCPF, formatPIS, cleanNumberString } from "@/types/employee";


const CriarManager = () => {
    // 💡 ESTADO DE UI (Sidebar) é o único estado mantido localmente
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
    const navigate = useNavigate();
    
    // 💡 HOOK: Toda a lógica de estado e actions
    const {
        form,
        companies,
        step,
        isSubmitting,
        isLoadingCompanies,
        usernameAvailability,
        setStep,
        checkUsername,
        onSubmit,
        handleGoBack,
    } = useEmployeeForm(); // Este hook é o motor de toda a página
    
    // Watchers do formulário para lógica de UI/debounce
    const watchedUsername = form.watch("username");
    
    // Lógica de debounce para checagem de username
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        if (watchedUsername.length >= 5) {
            debounceTimeout.current = setTimeout(() => {
                checkUsername(watchedUsername);
            }, 500);
        } else {
            checkUsername("");
        }

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [watchedUsername, checkUsername]);
    
    // Determina se o Passo 1 foi completado
    const isStep1Complete = form.formState.isValid;

    // Função para avançar para o Passo 2
    const handleNextStep = async () => {
        const isValid = await form.trigger([
            "name", "cpf", "email", "phoneNumber", "salary", 
            "jobTitle", "pis", "companyId", "homeOffice"
        ]);

        if (isValid) {
            setStep(2);
        }
    };
    
    // O handler final de submissão do formulário
    const handleSubmit = onSubmit('MANAGER'); // 💡 AQUI ESTÁ A DIFERENÇA: Papel MANAGER

    return (
        <div className="flex h-screen bg-background">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={handleToggleSidebar} />

                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 pt-20">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="ghost" size="icon" onClick={handleGoBack} aria-label="Voltar">
                                <ArrowLeft className="h-6 w-6 text-foreground" />
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                                    Criar Gestor
                                </h1>
                                <p className="text-muted-foreground">
                                    Preencha os dados do novo Gestor (Manager).
                                </p>
                            </div>
                        </div>

                        <Form {...form}>
                            {/* 💡 Submissão do formulário aponta para o handler final com o papel MANAGER */}
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6"> 
                                
                                {/* Passo 1: Dados Pessoais e Empresa */}
                                <Card className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <User className="h-5 w-5" /> 1. Dados Básicos
                                        </CardTitle>
                                        <CardDescription>Informações de contato e cargo.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nome Completo</FormLabel>
                                                    <FormControl><Input placeholder="Nome completo" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>

                                            <FormField control={form.control} name="cpf" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>CPF</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="000.000.000-00"
                                                            {...field}
                                                            onChange={(e) => field.onChange(cleanNumberString(e.target.value).slice(0, 11))} // Limpa e limita
                                                            value={formatCPF(cleanNumberString(field.value))} // Formata para exibição
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>

                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem><FormLabel>E-mail</FormLabel>
                                                    <FormControl><Input placeholder="email@exemplo.com" type="email" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            
                                            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                                <FormItem><FormLabel>Telefone</FormLabel>
                                                    <FormControl><Input placeholder="(99) 99999-9999" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>

                                            <FormField control={form.control} name="jobTitle" render={({ field }) => (
                                                <FormItem><FormLabel>Cargo</FormLabel>
                                                    <FormControl><Input placeholder="Ex: Desenvolvedor Sênior" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            
                                            <FormField control={form.control} name="salary" render={({ field }) => (
                                                <FormItem><FormLabel>Salário (R$)</FormLabel>
                                                    <FormControl><Input placeholder="5000.00" type="number" step="0.01" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            
                                            <FormField control={form.control} name="pis" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>PIS</FormLabel>
                                                    <FormControl>
                                                         <Input
                                                            placeholder="000.00000.00-0"
                                                            {...field}
                                                            onChange={(e) => field.onChange(cleanNumberString(e.target.value).slice(0, 11))} // Limpa e limita
                                                            value={formatPIS(cleanNumberString(field.value))} // Formata para exibição
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>

                                            {/* SELEÇÃO DE EMPRESA */}
                                            <FormField control={form.control} name="companyId" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Empresa</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCompanies}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={isLoadingCompanies ? "Carregando..." : "Selecione a empresa"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {companies.map(company => (
                                                                <SelectItem key={company.companyId} value={company.companyId}>
                                                                    {company.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            
                                            {/* HOME OFFICE */}
                                            <FormField control={form.control} name="homeOffice" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Modalidade</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione a modalidade" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="true">Home Office (Sim)</SelectItem>
                                                            <SelectItem value="false">Presencial (Não)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <Button type="button" onClick={handleNextStep} disabled={!isStep1Complete}>
                                                Próximo Passo <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Passo 2: Acesso e Senha */}
                                <Card className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Lock className="h-5 w-5" /> 2. Acesso e Senha
                                        </CardTitle>
                                        <CardDescription>Definição de username e senha inicial.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="username" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Username único" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                {/* Indicador de Disponibilidade */}
                                                <div className="flex items-center mt-2 text-sm">
                                                    {usernameAvailability === 'checking' && <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />}
                                                    {usernameAvailability === 'available' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                                                    {usernameAvailability === 'unavailable' && <Shield className="h-4 w-4 mr-2 text-red-500" />}
                                                    {usernameAvailability === 'checking' ? "Verificando..." :
                                                    usernameAvailability === 'available' ? "Disponível!" :
                                                    usernameAvailability === 'unavailable' ? "Indisponível. Tente outro." :
                                                    "Mínimo de 5 caracteres."}
                                                </div>
                                            </FormItem>
                                        )}/>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="password" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Senha</FormLabel>
                                                    <FormControl><Input placeholder="Senha inicial (min 6 chars)" type="password" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            
                                            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirmar Senha</FormLabel>
                                                    <FormControl><Input placeholder="Repita a senha" type="password" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                        </div>

                                        <Separator className="mt-6" />

                                        {/* Botão de Submissão do Passo 2 (Final) */}
                                        <div className="pt-6">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full h-14 text-lg font-semibold shadow-button hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-primary text-primary-foreground"
                                                disabled={isSubmitting || usernameAvailability !== 'available'}
                                            >
                                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Concluir Cadastro"}
                                            </Button>
                                        </div>
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
