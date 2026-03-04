// src/pages/TimeOffApprovals.tsx

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
import { Loader2, Search, Check, X, Download, Clock, User, CalendarCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { PaginationComponent } from "../components/ui/PaginationComponent";
import { StatusRecord } from '../types/recordApproval';
import { cn } from '../lib/utils';
import { downloadDocument } from '@/service/document.Service';

// ---------------------------------------------------------------------
// --- 1. FUNÇÕES DE UTILIDADE E TIPOS
// ---------------------------------------------------------------------

const formatBackendDate = (dateString: string): string => {
    const dateOnly = dateString.split(' ')[0];
    const parts = dateOnly.split(/[-\/\.]/); 

    if (parts.length === 3) {
        const year = parts[2]; 
        const month = parts[1]; 
        const day = parts[0]; 
        const shortYear = year.slice(-2); 
        return `${day}/${month}/${shortYear}`; 
    }
    return dateString;
};

// --- ATUALIZADO: Mapeamento de Status e Cores ---
const statusMap: Record<StatusRecord | string, string> = {
    TIME_OFF_REQUEST: 'Abono Pendente',
    WORK_TIME_REQUEST: 'Esq. Ponto Pendente', // 💡 Novo
    TIME_OFF: 'Abono Aprovado',
    TIME_OFF_REJECTED: 'Abono Rejeitado',
    UPDATED: 'Aprovado (Ajuste)', // 💡 Novo (Esquecimento Aprovado)
    UPDATE_REJECTED: 'Rejeitado (Ajuste)', // 💡 Novo (Esquecimento Rejeitado)
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
    ALL: 'Todos',
};

// --- ATUALIZADO: Rótulos do Filtro ---
const statusOptions: { value: StatusFilterType, label: string }[] = [
    { value: 'PENDING', label: 'Pendentes (Abonos/Esquecimentos)' },
    { value: 'APPROVED', label: 'Aprovados' },
    { value: 'REJECTED', label: 'Rejeitados' },
    { value: 'ALL', label: 'Todos os Status' },
];

type StatusFilterType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
// Hack para inferir o tipo do registro a partir do hook, caso não queira importar a interface explicitamente
type ITimeOffRecord = typeof useTimeOffApprovals extends () => { approvalsData: { records: infer R } | undefined } ? R extends (infer T)[] ? T : never : never;

const renderStatusBadge = (status: StatusRecord) => {
    const baseClasses = 'px-2.5 py-0.5 rounded-full text-xs font-medium border';
    
    switch (status) {
        case 'TIME_OFF_REQUEST':
            return <span className={cn(baseClasses, 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-800')}>{statusMap[status]}</span>;
        
        // 💡 NOVO CASE: Esquecimento de Ponto (Roxo)
        case 'FORGOTTEN_REGISTRATION':
            return <span className={cn(baseClasses, 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-800')}>{statusMap[status]}</span>;
            
        case 'TIME_OFF':
        case 'UPDATED': // Inclui UPDATED como verde (aprovado)
            return <span className={cn(baseClasses, 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800')}>{statusMap[status]}</span>;
            
        case 'TIME_OFF_REJECTED':
        case 'UPDATE_REJECTED': // Inclui UPDATE_REJECTED como vermelho (rejeitado)
            return <span className={cn(baseClasses, 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800')}>{statusMap[status]}</span>;
            
        default:
            return <span className={cn(baseClasses, 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300')}>{status}</span>;
    }
};

// ---------------------------------------------------------------------
// --- 2. HOOK DE RESPONSIVIDADE
// ---------------------------------------------------------------------

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = React.useState(window.innerWidth > 768); 
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
};

// ---------------------------------------------------------------------
// --- 3. COMPONENTE DE ITEM RESPONSIVO
// ---------------------------------------------------------------------

const ManualRegisterApprovalItem: React.FC<ITimeOffRecord & {
  handleAction: (id: number, action: 'approve' | 'reject') => void;
  handleDownload: (documentId?: string, employeeId?: string) => Promise<void>;
  isMutating: boolean;
}> = (props) => {
    const { 
        timeRecordId, employeeData, startWork, endWork, startHour, endHour, 
        hoursWork, statusRecord, documentDownloadPath, employeeId, 
        handleAction, handleDownload, isMutating 
    } = props;
    
    const isDesktop = useIsDesktop();
    
    // 💡 ATUALIZADO: Considera ambos os tipos como pendentes para mostrar botões
 
    const isPending = statusRecord === 'TIME_OFF_REQUEST' || statusRecord === 'WORK_TIME_REQUEST';
    const formattedStartWork = React.useMemo(() => formatBackendDate(startWork), [startWork]);
    const formattedEndWork = React.useMemo(() => formatBackendDate(endWork), [endWork]);
    const employeeName = employeeData.employeeName;

    // --- Layout para Desktop (Tabela) ---
    if (isDesktop) {
        return (
            <TableRow 
                key={timeRecordId} 
                className={cn(
                    'border-l-4', 
                    isMutating && 'opacity-50 pointer-events-none'
                )}
            >
                <TableCell className="font-medium">{employeeName}</TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <p className="font-medium text-foreground">
                            {formattedStartWork} - {startHour}
                        </p>
                        <p className="font-medium text-foreground">
                            {formattedEndWork} - {endHour}
                        </p>
                    </div>
                </TableCell>
                <TableCell>{hoursWork}</TableCell>
                <TableCell>{renderStatusBadge(statusRecord)}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                    
                    {documentDownloadPath && (
                        <Button
                            variant="outline"
                            size="icon"
                            title="Baixar Comprovante"
                            onClick={() => handleDownload(documentDownloadPath, employeeId)}
                            disabled={isMutating}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    )}

                    {isPending && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                title="Aprovar"
                                onClick={() => handleAction(timeRecordId, 'approve')}
                                disabled={isMutating}
                            >
                                <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                title="Rejeitar"
                                onClick={() => handleAction(timeRecordId, 'reject')}
                                disabled={isMutating}
                            >
                                <X className="h-4 w-4 text-red-500" />
                            </Button>
                        </>
                    )}
                </TableCell>
            </TableRow>
        );
    }

    // --- Layout para Mobile (Card) ---
    return (
        <Card 
            className={cn(
                "mb-4 overflow-hidden shadow-card border-l-4 transition-colors",
                isMutating && 'opacity-50 pointer-events-none'
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-muted/20">
                <CardTitle className="text-sm font-semibold flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    {employeeName}
                </CardTitle>
                <div className="flex items-center space-x-2">
                    {renderStatusBadge(statusRecord)}
                </div>
            </CardHeader>
            
            <CardContent className="p-4 text-sm space-y-2">
                <div className="flex items-center justify-between border-b pb-1">
                    <div className="font-medium flex items-center text-gray-500 dark:text-gray-400">
                        <CalendarCheck className="h-4 w-4 mr-1" /> De
                    </div>
                    <span className="font-bold text-sm">
                         {formattedStartWork} - {startHour}
                    </span>
                </div>

                 <div className="flex items-center justify-between border-b pb-1">
                    <div className="font-medium flex items-center text-gray-500 dark:text-gray-400">
                        <CalendarCheck className="h-4 w-4 mr-1" /> Até
                    </div>
                    <span className="font-bold text-sm">
                         {formattedEndWork} - {endHour}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <div className="font-medium flex items-center text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" /> Duração Total
                    </div>
                    <span className="font-extrabold text-primary">{hoursWork}</span>
                </div>
            </CardContent>
            
            <div className="flex justify-end space-x-3 p-4 pt-0 border-t bg-muted/50 dark:bg-muted/30">
                {documentDownloadPath && (
                    <Button
                        variant="ghost"
                        size="sm"
                        title="Baixar Comprovante"
                        onClick={() => handleDownload(documentDownloadPath, employeeId)}
                        disabled={isMutating}
                    >
                        <Download className="h-4 w-4 mr-1 text-primary" />
                        <span className='hidden sm:inline'>Download</span>
                    </Button>
                )}

                {isPending && (
                    <>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(timeRecordId, 'reject')}
                            disabled={isMutating}
                        >
                            <X className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Rejeitar</span>
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleAction(timeRecordId, 'approve')}
                            disabled={isMutating}
                        >
                            {isMutating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                            <span className="hidden sm:inline">Aprovar</span>
                        </Button>
                    </>
                )}
            </div>
        </Card>
    );
};

// ---------------------------------------------------------------------
// --- 4. COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------
const ManualRegisterApprovals = () => {
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
    
    const isDesktop = useIsDesktop();

    const currentRecords = approvalsData?.records || [];
    const totalPages = approvalsData?.totalPages ?? 0;
    const totalElements = approvalsData?.totalElements ?? 0;

    const handleDownload = async (documentId?: string, employeeId?: string) => {
        if (!documentId || !employeeId) {
            alert('Dados insuficientes para realizar o download.');
            return;
        }

        try {
            await downloadDocument(documentId, employeeId, `justificativa_abono_${employeeId}`);
        } catch (error) {
            console.error("Erro ao iniciar o download:", error);
            alert(`Falha ao baixar o documento: ${(error as Error).message}.`);
        }
    };
    
    const mainContent = (
    <div className="max-w-4xl mx-auto p-4 md:p-8 relative z-10">
        <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Aprovação de Abonos/Ajustes
            </h1>
        </div>

            <Card  className="mb-6 border-l-4 border-l-primary shadow-card">
                <CardContent className="flex flex-col md:flex-row gap-4 pt-6">
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Buscar Colaborador</label>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Nome do colaborador..."
                                value={employeeNameFilter}
                                onChange={(e) => setEmployeeNameFilter(e.target.value)}
                                disabled={isLoading || isMutating}
                                className='bg-primary/10 hover:bg-primary/15 shadow-button transition-smooth'
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <Button 
                                className= "bg-primary hover:bg-primary/70 text-primary-foreground font-semibold shadow-button transition-smooth" 
                                onClick={handleSearch} 
                                disabled={isLoading || isMutating} 
                                variant="secondary"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="w-full md:w-1/4">
                        <label className="text-sm font-medium mb-1 block">Status</label>
                        <Select 
                            value={statusFilter} 
                            onValueChange={(value: StatusFilterType) => setStatusFilter(value)}
                            disabled={isLoading || isMutating}
                            >
                            <SelectTrigger className='bg-primary/10 hover:bg-primary/15 shadow-button transition-smooth'>
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

            {isLoading && currentRecords.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Carregando dados...</p>
                </div>
            ) : currentRecords.length > 0 ? (
                <>
                    {isDesktop ? (
                        // --- Exibição Desktop ---
                        <Card  className="mb-6 border-l-4 border-l-primary shadow-card relative">
                             {isLoading && (
                                <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10 rounded-lg">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                </div>
                            )}
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
                                    {currentRecords.map((record) => (
                                        <ManualRegisterApprovalItem
                                            key={record.timeRecordId}
                                            {...record}
                                            handleAction={handleAction}
                                            handleDownload={handleDownload}
                                            isMutating={isMutating}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    ) : (
                        // --- Exibição Mobile ---
                        <div className="space-y-4 relative">
                             {isLoading && (
                                <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10 rounded-lg">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                </div>
                            )}
                            {currentRecords.map((record) => (
                                <ManualRegisterApprovalItem
                                    key={record.timeRecordId}
                                    {...record}
                                    handleAction={handleAction}
                                    handleDownload={handleDownload}
                                    isMutating={isMutating}
                                />
                            ))}
                        </div>
                    )}

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
                <Alert className='bg-primary/10 hover:bg-primary/15 text-foreground shadow-button transition-smooth'>
                    <AlertTitle className='text-foreground'>Nenhuma solicitação encontrada</AlertTitle>
                    <AlertDescription className='text-foreground'>
                        {employeeNameFilter 
                            ? `Nenhuma solicitação encontrada para o colaborador "${employeeNameFilter}" no status ${statusMap[statusFilter]}.`
                            : `Não há solicitações neste status.`
                        }
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );

    return (
    <div className="min-h-screen bg-background relative  overflow-hidden">
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

      <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
                {mainContent}
                </main>
            </div>
        </div>
    );
};

export default ManualRegisterApprovals;