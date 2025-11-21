import React, { useCallback, useState, useMemo } from "react";
import { usePendingApprovals } from "../hooks/usePendingApproval";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
import { Clock, Loader2, Search, X, Check, CalendarCheck, ArrowRight, User } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import { PaginationComponent } from "../components/ui/PaginationComponent";
import { format, parseISO } from "date-fns";
import { ITimeRecordApprovalResponse } from "@/types/recordApproval";

// --- Adaptação de Responsividade ---
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768); 
  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isDesktop;
};


// --- Componente de Item da Tabela/Card ---
const ApprovalItem: React.FC<ITimeRecordApprovalResponse & {
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isMutating: boolean;
}> = (props) => {
  const {
    timeRecordId,
    partnerName,
    newStartWork,
    newEndWork,
    currentStartWork,
    currentEndWork,
    onApprove,
    onReject,
    isMutating,
  } = props;
    
  const isDesktop = useIsDesktop();

  // Memóiza o formato das datas para melhor performance
  const currentStart = useMemo(() => format(parseISO(currentStartWork), "dd/MM HH:mm"), [currentStartWork]);
  const currentEnd = useMemo(() => currentEndWork
    ? format(parseISO(currentEndWork), "dd/MM HH:mm")
    : "PENDENTE", [currentEndWork]);
  const newStart = useMemo(() => format(parseISO(newStartWork), "dd/MM HH:mm"), [newStartWork]);
  const newEnd = useMemo(() => format(parseISO(newEndWork), "dd/MM HH:mm"), [newEndWork]);


  // Layout para Desktop (Tabela) - MANTIDO ESTÁVEL
  return isDesktop ? (
    <TableRow>
      <TableCell className="font-medium">{timeRecordId}</TableCell>
      <TableCell>{partnerName}</TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <Badge variant="secondary" className="justify-center">Atual</Badge>
          <span>{currentStart} - {currentEnd}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          {/* Destaque para a proposta (cor amber) */}
          <Badge className="bg-amber-500 hover:bg-amber-600 justify-center">Proposto</Badge> 
          <span className="font-bold text-amber-600 dark:text-amber-400">{newStart} - {newEnd}</span>
        </div>
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button
          variant="secondary"
          onClick={() => onReject(timeRecordId)}
          disabled={isMutating}
        >
          <X className="h-4 w-4 mr-2" />
          Rejeitar
        </Button>
        <Button
          onClick={() => onApprove(timeRecordId)}
          disabled={isMutating}
        >
          {isMutating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
          Aprovar
        </Button>
      </TableCell>
    </TableRow>
  ) : (
    // NOVO LAYOUT RESPONSIVO COM BORDA TEMÁTICA E MELHOR CLAREZA
    <Card 
        className="
            mb-4 overflow-hidden shadow-card 
            border-l-4 border-l-primary hover:border-l-primary/80 transition-colors
        "
    >
        {/* Cabeçalho */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-primary/10 dark:bg-primary/20">
            <CardTitle className="text-sm font-semibold flex items-center text-primary">
                <User className="h-4 w-4 mr-2" />
                {partnerName}
            </CardTitle>
            <Badge className="text-xs bg-amber-500 hover:bg-amber-600">
                Aguardando (# {timeRecordId})
            </Badge>
        </CardHeader>
        
        {/* Corpo: Comparação Lado a Lado */}
        <CardContent className="p-4 grid grid-cols-2 gap-x-2 text-sm relative">
            {/* Bloco ATUAL */}
            <div className="flex flex-col border-r pr-2 space-y-1">
                <div className="font-medium flex items-center text-gray-500 dark:text-gray-400 mb-1">
                    <CalendarCheck className="h-4 w-4 mr-1" /> Atual
                </div>
                <p className="font-mono text-xs truncate">
                    De: <span className="font-semibold">{currentStart}</span>
                </p>
                <p className="font-mono text-xs truncate">
                    Até: <span className="font-semibold">{currentEnd}</span>
                </p>
            </div>
            
            {/* Divisor Visual (Seta ou Fluxo) */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card p-1 rounded-full border border-gray-300 dark:border-gray-600 z-10">
                <ArrowRight className="h-4 w-4 text-primary" />
            </div>

            {/* Bloco PROPOSTO (Destaque visual) */}
            <div className="flex flex-col pl-2 space-y-1 bg-amber-50 dark:bg-amber-950/50 rounded-r p-2 ml-auto w-full border-l border-dashed border-amber-300 dark:border-amber-700">
                <div className="font-medium flex items-center text-amber-600 dark:text-amber-400 mb-1">
                    <Clock className="h-4 w-4 mr-1" /> Proposto
                </div>
                <p className="font-mono text-xs truncate">
                    De: <span className="font-extrabold">{newStart}</span>
                </p>
                <p className="font-mono text-xs truncate">
                    Até: <span className="font-extrabold">{newEnd}</span>
                </p>
            </div>
        </CardContent>
        
        {/* Rodapé: Ações (Botões) */}
        <div className="flex justify-end space-x-3 p-4 pt-0 border-t bg-muted/50 dark:bg-muted/30">
            <Button
                variant="destructive"
                size="sm"
                onClick={() => onReject(timeRecordId)}
                disabled={isMutating}
            >
                <X className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Rejeitar</span>
            </Button>
            <Button
                size="sm"
                onClick={() => onApprove(timeRecordId)}
                disabled={isMutating}
            >
                {isMutating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                <span className="hidden sm:inline">Aprovar</span>
            </Button>
        </div>
    </Card>
  );
};


// --- Componente Principal ---

export const PendingApprovals = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [filterName, setFilterName] = useState(""); 
  const [searchName, setSearchName] = useState(""); 
  
  const isDesktop = useIsDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);


  const { data, isLoading, isMutating, approve, reject } = usePendingApprovals({
    page: currentPage,
    employeeName: searchName,
  });

  const handleSearch = () => {
    setCurrentPage(0); // Volta para a primeira página ao buscar
    setSearchName(filterName);
  };

  const handleClearSearch = () => {
    setFilterName("");
    setSearchName("");
    setCurrentPage(0);
  };

  const approvals = data?.approvals || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;


  // Conteúdo principal da tela
  const mainContent = (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Aprovações de Ponto Pendentes
            </h1>
        </div>

        {/* Barra de Pesquisa e Filtro (COM BORDA TEMÁTICA) */}
        <Card className="mb-6 border-l-4 border-l-primary shadow-card">
            <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-stretch">
            <div className="relative flex-grow">
                <Input
                placeholder="Filtrar por nome do colaborador..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
                disabled={isMutating}
                />
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex gap-2">
                <Button 
                    onClick={handleSearch} 
                    disabled={filterName === searchName || isMutating}
                >
                    Buscar
                </Button>
                {(searchName !== "" || currentPage !== 0) && (
                <Button variant="outline" onClick={handleClearSearch} disabled={isMutating}>
                    Limpar
                </Button>
                )}
            </div>
            </CardContent>
        </Card>


        {/* Lógica de Exibição da Lista/Tabela */}
        {isLoading && !data ? (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando solicitações...</span>
            </div>
        ) : approvals.length === 0 && searchName === "" ? (
            <Card className="border-l-4 border-l-primary shadow-card">
                <CardContent className="p-6 text-center text-lg text-gray-500">
                    Nenhuma solicitação de aprovação encontrada.
                </CardContent>
            </Card>
        ) : approvals.length === 0 && searchName !== "" ? (
            <Card className="border-l-4 border-l-primary shadow-card">
                <CardContent className="p-6 text-center text-lg text-gray-500">
                    Nenhuma solicitação encontrada para o colaborador "{searchName}".
                </CardContent>
            </Card>
        ) : (
            <>
            {isDesktop ? (
                <Card className="relative border-l-4 border-l-primary shadow-card">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10 rounded-lg">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    )}
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Registro Atual</TableHead>
                        <TableHead>Proposta de Alteração</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {approvals.map((approval) => (
                        <ApprovalItem
                            key={approval.timeRecordId}
                            {...approval}
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
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10 rounded-lg">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    )}
                    {approvals.map((approval) => (
                        <ApprovalItem
                        key={approval.timeRecordId}
                        {...approval}
                        onApprove={approve}
                        onReject={reject}
                        isMutating={isMutating}
                        />
                    ))}
                </div>
            )}

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
          {mainContent}
          </main>
      </div>
      </div>
  );
};

export default PendingApprovals;
