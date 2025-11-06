// ARQUIVO: src/pages/RequestVacation.tsx

import React, { useCallback, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useVacationRequest } from "../hooks/useVacationRequest"; // Importa o hook
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { format, isPast } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Send, User, Clock, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

 
export const RequestVacation = () => {
    const {
        startDate, setStartDate,
        endDate, setEndDate,
        managerId, setManagerId,
        managerOptions,
        isLoadingManagers,
        isSubmitting,
        onSubmit,
    } = useVacationRequest();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
    
    // Filtro para desativar dias passados no calendário
    const isPastDayDisabled = (date: Date) => isPast(date) && !isPast(date.setDate(date.getDate() + 1));

    // Verifica se o botão deve ser desativado
    const isFormInvalid = !startDate || !endDate || !managerId || isSubmitting || startDate > endDate;


    const mainContent = (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title flex items-center">
                    <Clock className="h-6 w-6 mr-3 text-primary"/>
                    Solicitação de Férias
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Selecione o período de descanso e o gestor responsável pela aprovação.
                </p>
            </div>

            <Card className="border-l-4 border-l-primary shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Detalhes da Solicitação</CardTitle>
                    <CardDescription>O período de férias deve ser futuro e contínuo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    
                    {/* Seleção de Data de Início */}
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Data de Início *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                    disabled={isSubmitting}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Selecione a data inicial</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    disabled={isPastDayDisabled} // Desabilita dias passados
                                    initialFocus
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Seleção de Data de Fim */}
                    <div className="space-y-2">
                        <Label htmlFor="endDate">Data de Fim *</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                    disabled={isSubmitting}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP", { locale: ptBR }) : <span>Selecione a data final</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    disabled={isPastDayDisabled} // Desabilita dias passados
                                    initialFocus
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                        {startDate && endDate && endDate < startDate && (
                            <div className="text-sm text-destructive mt-1 flex items-center"> 
                                <AlertTriangle className="h-4 w-4 mr-1"/> A data de fim deve ser igual ou posterior à data de início.
                            </div>
                        )}
                    </div>
                    
                    {/* Seleção de Manager */}
                    <div className="space-y-2">
                        <Label htmlFor="managerId">Manager para Aprovação *</Label>
                        <Select value={managerId} onValueChange={setManagerId} disabled={isLoadingManagers || isSubmitting}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Manager" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingManagers ? (
                                    // CORREÇÃO: Valor não pode ser string vazia ("")
                                    <SelectItem value="__LOADING__" disabled>Carregando Managers...</SelectItem> 
                                ) : managerOptions.length === 0 ? (
                                    // CORREÇÃO: Valor não pode ser string vazia ("")
                                    <SelectItem value="__NONE__" disabled>Nenhum Manager disponível na empresa</SelectItem> 
                                ) : (
                                    managerOptions.map((manager) => (
                                        <SelectItem key={manager.userId} value={manager.userId}>
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 mr-2 opacity-70" />
                                                {manager.username}
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {isLoadingManagers && (
                            <div className="flex items-center text-xs text-gray-500">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Buscando lista de gestores...
                            </div>
                        )}
                    </div>

                    {/* Botão de Envio */}
                    <Button
                        onClick={onSubmit}
                        className="w-full bg-primary/60 hover:bg-primary/70 mt-4"
                        disabled={isFormInvalid}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5 mr-2" />
                        )}
                        Solicitar Férias
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    // Renderização da estrutura com Sidebar e Header
    return (
        <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
            <Header toggleSidebar={handleToggleSidebar} />

            <main className="flex-1 mobile-container py-4 pt-20 pb-8">
            {mainContent}
            </main>
        </div>
        </div>
    );
};

export default RequestVacation;