import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useTimeOffApprovals } from '../hooks/useTimeOffApprovals';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, Search, Check, X, Download, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { PaginationComponent } from "../components/ui/PaginationComponent";
import { StatusRecord } from '../types/recordApproval';
import { cn } from '../lib/utils';
import { API_BASE_URL } from '../config/api';


// --- Mapeamento de Status e Cores ---
const statusMap: Record<StatusRecord | string, string> = {
    TIME_OFF_REQUEST: 'Pendente',
    TIME_OFF: 'Aprovado',
    TIME_OFF_REJECTED: 'Rejeitado',
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
    ALL: 'Todos',
};

const statusOptions: { value: StatusFilterType, label: string }[] = [
    { value: 'PENDING', label: 'Pendentes' },
    { value: 'APPROVED', label: 'Aprovados' },
    { value: 'REJECTED', label: 'Rejeitados' },
    { value: 'ALL', label: 'Todos os Status' },
];

type StatusFilterType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

const getBorderColorClass = (status: StatusRecord): string => {
    switch (status) {
        case 'TIME_OFF_REQUEST':
            return 'border-l-yellow-500'; // Amarelo para pendente
        case 'TIME_OFF':
            return 'border-l-green-500';  // Verde para aprovado
        case 'TIME_OFF_REJECTED':
            return 'border-l-red-500';    // Vermelho para rejeitado
        default:
            return 'border-l-gray-500';
    }
};

const renderStatusBadge = (status: StatusRecord) => {
    const baseClasses = 'px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
        case 'TIME_OFF_REQUEST':
            return <span className={cn(baseClasses, 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300')}>{statusMap[status]}</span>;
        case 'TIME_OFF':
            return <span className={cn(baseClasses, 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300')}>{statusMap[status]}</span>;
        case 'TIME_OFF_REJECTED':
            return <span className={cn(baseClasses, 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300')}>{statusMap[status]}</span>;
        default:
            return <span className={cn(baseClasses, 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300')}>{status}</span>;
    }
};

// --- Componente Principal ---
const TimeOffApprovals = () => {
    const { 
        approvalsData, 
        isLoading, 
        isMutating,
        currentPage, 
        setCurrentPage,
        employeeNameFilter, 
        setEmployeeNameFilter, 
        statusFilter, 
        setStatusFilter, 
        handleSearch, 
        handleAction,
        sidebarOpen,
        handleToggleSidebar,
    } = useTimeOffApprovals();

    const currentRecords = approvalsData?.records || [];
    const totalPages = approvalsData?.totalPages ?? 0;
    const totalElements = approvalsData?.totalElements ?? 0;

    const handleDownload = (documentPath?: string) => {
        if (documentPath) {
            // Assume que documentPath é '/documents/{documentId}'
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token de autenticação ausente.');
                return;
            }
            // Adiciona o token na URL e abre uma nova janela para forçar o download
            const fullUrl = `${API_BASE_URL}${documentPath}?token=${token}`;
            window.open(fullUrl, '_blank');
        }
    };
    
    // Conteúdo principal da página
     const mainContent = (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Aprovação de Abonos Manuais
            </h1>
        </div>

            {/* CARD DE FILTROS */}
            <Card  className="mb-6 border-l-4 border-l-primary shadow-card">
                 
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium mt-3 mb-3 block">Buscar Colaborador</label>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Nome do colaborador..."
                                value={employeeNameFilter}
                                onChange={(e) => setEmployeeNameFilter(e.target.value)}
                                disabled={isLoading || isMutating}
                                className='bg-primary/10 hover:bg-primary/15  shadow-button transition-smooth'
                            />
                            <Button className= "bg-primary hover:bg-primary/70 text-primary-foreground font-semibold shadow-button transition-smooth" onClick={handleSearch} disabled={isLoading || isMutating} variant="secondary">
                                <Search className="h-4 w-4 " />
                            </Button>
                        </div>
                    </div>
                    <div className="w-full md:w-1/4">
                        <label className="text-sm font-medium mt-3 mb-3 block">Status</label>
                        <Select 
                            value={statusFilter} 
                            onValueChange={(value: StatusFilterType) => setStatusFilter(value)}
                            disabled={isLoading || isMutating}
                            >
                            <SelectTrigger className='bg-primary/10 hover:bg-primary/15  shadow-button transition-smooth'>
                                <SelectValue className='text-foreground' placeholder="Selecione o Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* CARD DE LISTAGEM */}
             <Card  className="mb-6 border-l-4 border-l-primary shadow-card">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center text-xl">
                        Solicitações ({statusMap[statusFilter]})
                        {(isMutating) && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(isLoading && currentRecords.length === 0) ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-2 text-muted-foreground">Carregando dados...</p>
                        </div>
                    ) : currentRecords.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Colaborador</TableHead>
                                        <TableHead>Período Solicitado</TableHead>
                                        <TableHead>Duração (Total)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentRecords.map((record) => {
                                        const isPending = record.statusRecord === 'TIME_OFF_REQUEST';
                                        const startWorkDate = new Date(record.startWork).toLocaleDateString('pt-BR');
                                        const endWorkDate = record.endWork ? new Date(record.endWork).toLocaleDateString('pt-BR') : '-';
                                        
                                        return (
                                            <TableRow 
                                                key={record.timeRecordId} 
                                                className={cn(
                                                    'border-l-4', // Classe de borda padrão
                                                    getBorderColorClass(record.statusRecord), // Cor da borda
                                                    isMutating && 'opacity-50 pointer-events-none'
                                                )}
                                            >
                                                <TableCell className="font-medium">{record.employeeData.employeeName}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{startWorkDate} {record.startHour}</span>
                                                        <span>{endWorkDate} {record.endHour}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{record.hoursWork}</TableCell>
                                                <TableCell>{renderStatusBadge(record.statusRecord)}</TableCell>
                                                <TableCell className="text-right flex justify-end gap-2">
                                                    
                                                    {/* Botão de Download */}
                                                    {record.documentDownloadPath && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            title="Baixar Comprovante"
                                                            onClick={() => handleDownload(record.documentDownloadPath)}
                                                            disabled={isMutating}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {/* Botões de Ação (Apenas se Pendente) */}
                                                    {isPending && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                title="Aprovar Abono"
                                                                onClick={() => handleAction(record.timeRecordId, 'approve')}
                                                                disabled={isMutating}
                                                            >
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                title="Rejeitar Abono"
                                                                onClick={() => handleAction(record.timeRecordId, 'reject')}
                                                                disabled={isMutating}
                                                            >
                                                                <X className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {/* Paginação */}
                            <div className="mt-6 flex justify-center">
                                {totalPages > 1 && (
                                    <PaginationComponent
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        onPageChange={setCurrentPage}
                                        totalElements={totalElements}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <Alert className='bg-primary/10 hover:bg-primary/15 text-foreground  shadow-button transition-smooth'>
                            <AlertTitle className='text-foreground'>Nenhuma solicitação encontrada</AlertTitle>
                            <AlertDescription className='text-foreground'>Não há solicitações de abono manual no status {statusMap[statusFilter]}.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    // Renderização da estrutura principal (mantendo o padrão de PendingApprovals.tsx)
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">

            {/* Animated Background (Mantido para o layout) */}

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

                <main className="flex-1 mobile-container py-4 pt-20 pb-8">
                {mainContent}
                </main>
            </div>
        </div>
    );
};

export default TimeOffApprovals;