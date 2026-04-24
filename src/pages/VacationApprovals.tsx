// ARQUIVO: src/pages/VacationApprovals.tsx

import React, { useCallback, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useVacationApprovals } from "../hooks/useVacationApprovals";
import { IVacationQueryParams, IVacationRequestResponse } from "@/types/vacation";
import {
    Card, CardContent, CardHeader, CardTitle,
} from "../components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Loader2, Search, X, Check, Calendar, User, Clock, Ban, ArrowRight } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { format, parse, isValid } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// --- Função Auxiliar de Responsividade (Padrão) ---
const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
    React.useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isDesktop;
};


// --- Componente de Item Consolidado (Tabela/Card) ---
const VacationItem: React.FC<IVacationRequestResponse & {
    onApprove: (ids: number[]) => void;
    onReject: (ids: number[]) => void;
    isMutating: boolean;
}> = (props) => {
    const {
        employeeName,
        startDate,
        endDate,
        status,
        timeRecordIdsForApproval,
        onApprove,
        onReject,
        isMutating,
    } = props;

    const isDesktop = useIsDesktop();
    const isPending = status === 'REQUEST_VACATION';

    // Mapeamento de Status usando classes de tema
    const statusMap = useMemo(() => {
        switch (status) {
            case 'REQUEST_VACATION':
                // Alerta/Atenção: usando a cor amber (padrão de aviso) com ajustes de opacidade/sombra
                return { 
                    label: "AGUARDANDO APROVAÇÃO", 
                    color: "bg-amber-500 hover:bg-amber-600", 
                    icon: Clock, 
                    border: "border-l-amber-500" 
                };
            case 'VACATION':
                // Aprovação/Sucesso: usando a cor primária
                return { 
                    label: "APROVADO", 
                    color: "bg-primary hover:bg-primary/90", 
                    icon: Check, 
                    border: "border-l-primary" 
                };
            case 'VACATION_REJECTED':
                // Rejeição/Erro: usando a cor destrutiva
                return { 
                    label: "REJEITADO", 
                    color: "bg-destructive hover:bg-destructive/90", 
                    icon: Ban, 
                    border: "border-l-destructive" 
                };
            default:
                return { label: status, color: "bg-gray-500", icon: Calendar, border: "border-l-gray-500" };
        }
    }, [status]);
    
    // Formatação de Datas
    const dateFormat = 'dd-MM-yyyy';
    const formattedStartDate = useMemo(() => {
        const parsedDate = parse(startDate, dateFormat, new Date());
        return isValid(parsedDate) ? format(parsedDate, "dd/MM/yyyy", { locale: ptBR }) : "Inválida";
    }, [startDate]);
    
    const formattedEndDate = useMemo(() => {
        const parsedDate = parse(endDate, dateFormat, new Date());
        return isValid(parsedDate) ? format(parsedDate, "dd/MM/yyyy", { locale: ptBR }) : "Inválida";
    }, [endDate]);
    
    const totalDays = useMemo(() => timeRecordIdsForApproval.length, [timeRecordIdsForApproval]);

    const Icon = statusMap.icon;

    // Layout para Desktop (Tabela)
    return isDesktop ? (
        <TableRow 
            // Fundo suave de alerta para pendentes
            className={cn({ "bg-amber-50/50 dark:bg-amber-950/10": isPending })}
        >
            <TableCell className="font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-primary" />
                {employeeName}
            </TableCell>
            <TableCell>
                <div className="flex items-center space-x-1 font-mono text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formattedStartDate}</span>
                    <ArrowRight className="h-3 w-3 text-primary" />
                    <span>{formattedEndDate}</span>
                </div>
            </TableCell>
            <TableCell>
                <Badge className={cn("text-xs font-semibold", statusMap.color, "hover:opacity-90")}>
                    <Icon className="h-3 w-3 mr-1" />
                    {statusMap.label} ({totalDays} dias)
                </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
                {isPending ? (
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => onReject(timeRecordIdsForApproval)}
                            disabled={isMutating}
                            // Cor do texto e borda destrutiva, fundo levemente colorido
                            className="text-red-400 border-destructive hover:bg-destructive/20 dark:hover:bg-destructive/30"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Rejeitar Lote
                        </Button>
                        <Button
                            onClick={() => onApprove(timeRecordIdsForApproval)}
                            disabled={isMutating}
                            // Botão padrão usa cor primária do tema
                        >
                            {isMutating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Aprovar Lote
                        </Button>
                    </>
                ) : (
                    <Badge variant="outline" className={cn("text-muted-foreground")}>
                        Ação Finalizada
                    </Badge>
                )}
            </TableCell>
        </TableRow>
    ) : (
        // Layout Responsivo (Card)
        <Card 
            className={cn(
                "mb-4 overflow-hidden shadow-card border-l-4 transition-colors",
                statusMap.border // Usa a cor do status para a borda lateral
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-muted/30">
                <CardTitle className="text-sm font-semibold flex items-center text-foreground">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    {employeeName}
                </CardTitle>
                <Badge className={cn("text-xs font-semibold", statusMap.color)}>
                    <Icon className="h-3 w-3 mr-1" />
                    {statusMap.label}
                </Badge>
            </CardHeader>
            
            <CardContent className="p-4 space-y-2 text-sm">
                <p className="font-medium flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Período: 
                    <span className="font-bold ml-1 text-foreground">{formattedStartDate}</span>
                    <span className="mx-1 text-primary">-</span>
                    <span className="font-bold text-foreground">{formattedEndDate}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                    Total de dias: {totalDays}
                </p>
            </CardContent>
            
            <div className="flex justify-end space-x-3 p-4 pt-0 border-t bg-muted/50 dark:bg-muted/30">
                {isPending && (
                    <>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onReject(timeRecordIdsForApproval)}
                            disabled={isMutating}
                        >
                            <X className="h-4 w-4 mr-1 sm:mr-2" />
                            Rejeitar
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onApprove(timeRecordIdsForApproval)}
                            disabled={isMutating}
                        >
                            {isMutating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                            Aprovar
                        </Button>
                    </>
                )}
            </div>
        </Card>
    );
};


// --- Componente Principal de Página ---

const statusOptions = [
    { value: 'PENDING', label: 'Aguardando Aprovação' },
    { value: 'APPROVED', label: 'Aprovado' },
    { value: 'REJECTED', label: 'Rejeitado' },
    { value: 'ALL', label: 'Todos' },
];

export const VacationApprovals = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [filterName, setFilterName] = useState(""); 
    const [searchName, setSearchName] = useState(""); 
    const [filterStatus, setFilterStatus] = useState<IVacationQueryParams["status"]>("PENDING"); 
    const [searchStatus, setSearchStatus] = useState<IVacationQueryParams["status"]>("PENDING"); 
    const size = 10;
    
    const isDesktop = useIsDesktop();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);


    const { requests, isLoading, isMutating, approve, reject } = useVacationApprovals({
        page: currentPage,
        size: size,
        employeeName: searchName,
        status: searchStatus,
    });

    const handleSearch = () => {
        setCurrentPage(0); // Volta para a primeira página ao buscar
        setSearchName(filterName);
        setSearchStatus(filterStatus);
    };

    const handleClearSearch = () => {
        setFilterName("");
        setSearchName("");
        setFilterStatus("PENDING");
        setSearchStatus("PENDING");
        setCurrentPage(0);
    };


    // Conteúdo principal da tela
    const mainContent = (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="mb-6 sm:mb-8">
                <h1 
                    // Título usando a cor primária do tema
                    className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title"
                >
                    Gestão de Solicitações de Férias
                </h1>
            </div>

            {/* Barra de Pesquisa e Filtro de Status */}
            <Card 
                // Borda usando a cor primária do tema
                className="mb-6 border-l-4 border-l-primary shadow-card"
            >
                <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-stretch">
                    {/* Filtro por Nome */}
                    <div className="relative flex-grow">
                        <Input
                        placeholder="Filtrar por nome do colaborador..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-10"
                        disabled={isMutating}
                        />
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>

                    {/* Filtro por Status */}
                    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as IVacationQueryParams["status"])} disabled={isMutating}>
                        <SelectTrigger className="w-[200px] md:w-[250px]">
                            <SelectValue placeholder="Filtrar por Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {/* Botões de Ação */}
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleSearch} 
                            disabled={(filterName === searchName && filterStatus === searchStatus) || isMutating}
                        >
                            Buscar
                        </Button>
                        {(searchName !== "" || searchStatus !== "PENDING") && (
                        <Button variant="outline" onClick={handleClearSearch} disabled={isMutating}>
                            Limpar
                        </Button>
                        )}
                    </div>
                </CardContent>
            </Card>


            {/* Lógica de Exibição da Lista/Tabela */}
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Carregando solicitações de férias...</span>
                </div>
            ) : requests.length === 0 ? (
                <Card className="border-l-4 border-l-primary shadow-card">
                    <CardContent className="p-6 text-center text-lg text-muted-foreground">
                        Nenhuma solicitação encontrada com o filtro aplicado.
                    </CardContent>
                </Card>
            ) : (
                <>
                {isDesktop ? (
                    <Card className="relative border-l-4 border-l-primary shadow-card">
                        {isMutating && (
                            <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 rounded-lg">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        )}
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Período de Férias</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                            <VacationItem
                                key={request.employeeId + request.startDate} // Chave combinada
                                {...request}
                                onApprove={approve}
                                onReject={reject}
                                isMutating={isMutating}
                            />
                            ))}
                        </TableBody>
                        </Table>
                    </Card>
                ) : (
                    // Exibição Mobile (Cards)
                    <div className="space-y-4 relative">
                        {isMutating && (
                            <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 rounded-lg">
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            </div>
                        )}
                        {requests.map((request) => (
                            <VacationItem
                            key={request.employeeId + request.startDate}
                            {...request}
                            onApprove={approve}
                            onReject={reject}
                            isMutating={isMutating}
                            />
                        ))}
                    </div>
                )}
                </>
            )}
        </div>
    );


    // Renderização da estrutura com Sidebar e Header
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
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />

      <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
            {mainContent}
            </main>
        </div>
        </div>
    );
};

export default VacationApprovals;
