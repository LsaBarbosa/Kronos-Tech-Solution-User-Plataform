// ARQUIVO: src/pages/Dashboard.tsx (Com alterações no Card de Pendências)

import { useState, useCallback, useMemo } from "react";
import Clock from "@/components/Clock";
import { 
    ArrowRight, Loader2, Clock as ClockIcon, FileCheck, DollarSign, Mail, 
    Briefcase, Phone, MessageSquareWarning, Zap, User2, Building, Eye, EyeOff, 
    PlusCircle, ListChecks, ActivitySquare, AlertTriangle, Plane, // ÍCONE: Plane
    TreePalm,Activity,
    TimerReset
} from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useVacationCount } from "@/hooks/useVacationCount"; 
import { useTimeOffCount } from "@/hooks/useTimeOffCount"; 
import PageShell from "@/components/PageShell";
import { getRoleDisplayName } from "@/types/dashboard";
import {
    formatPhone,
    formatSalary,
    getFirstName,
    getSecondName,
    getThemeCardClasses,
} from "@/utils/dashboard-utils";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSalary, setShowSalary] = useState(false); 
  
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleSalary = useCallback(() => setShowSalary(prev => !prev), []); // Toggle do salário
  const getCardKeyDownHandler = useCallback(
    (action: () => void) => (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    },
    []
  );
  
  const navigate = useNavigate();

  const {
    userData,
    isLoading,
    pendingApprovalsCount, 
    newWarnings,
    hasApprovalPermission,
    fetchProfile, 
    handleWarningClick,
  } = useDashboardData();
  
  // 1. OBTENÇÃO DA CONTAGEM DE FÉRIAS
  const { pendingVacationCount } = useVacationCount(hasApprovalPermission); 
  const { pendingTimeOffCount } = useTimeOffCount(hasApprovalPermission);
  // Handlers de Navegação
  const handleApprovalClick = useCallback(() => {
    navigate("/apuracao-horas"); // Pendências de TimeRecord
  }, [navigate]);

  // NOVO HANDLER para Férias (usado nos botões de detalhe)
  const handleVacationApprovalClick = useCallback(() => {
    navigate("/ferias"); // Rota para a nova tela de aprovação de férias
  }, [navigate]);

  const handleTimeOffApprovalClick = useCallback(() => {
    navigate("/aprovacoes-abono"); // Rota para a tela de aprovação de abonos (TimeOffApprovals.tsx)
  }, [navigate]);

  const handleClockCardClick = useCallback(() => { // Card Controle de Ponto
    navigate("/relatorio-detalhado"); 
  }, [navigate]);

  // Redirecionamento do Card de Detalhes do Usuário
  const handleDetailsCardClick = useCallback(() => {
    navigate("/usuario");
  }, [navigate]);
  
  const isCto = useMemo(() => userData?.role === 'CTO', [userData?.role]);
  const isManager = useMemo(() => userData?.role === 'MANAGER', [userData?.role]); 
  
  // Handler para o link da empresa (clique na span dentro do card)
  const handleCompanyLinkClick = useCallback((event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.stopPropagation(); // Impede que o clique suba para o Card e navegue para /usuario
    if (isCto) {
      navigate("/empresa");
    }
  }, [isCto, navigate]);

  // Handler para o botão da empresa (clique no botão dentro do card)
  const handleCompanyButtonClick = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation(); // Impede que o clique suba para o Card e navegue para /usuario
    if (isCto) {
      navigate("/empresa");
    }
  }, [isCto, navigate]);

  // Handler para o Card de Avisos para não-MANAGERs
  const handleAvisosCardClick = useCallback(() => {
    if (!isManager && newWarnings.length > 0) {
        handleWarningClick(); // Marca como visto e navega para /avisos
    }
  }, [isManager, newWarnings.length, handleWarningClick]);
  
  // 2. SOMA TOTAL DE PENDÊNCIAS 
  const totalPendingCount = useMemo(() => 
    pendingApprovalsCount + pendingVacationCount + pendingTimeOffCount, // ADICIONA ABONO
    [pendingApprovalsCount, pendingVacationCount, pendingTimeOffCount] // Adiciona a dependência
  );
  /**
   * Função auxiliar para aplicar estilização temática de Card.
   * **ATUALIZADO:** Adiciona classes de borda lateral e sombra para consistência.
   * @param baseColor Cor base ('primary', 'destructive', 'success', 'yellow-600').
   */
  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
    >
          <div className="max-w-6xl mx-auto">
            
            {/* SAUDAÇÃO PERSONALIZADA */}
            <h1 className="text-3xl font-bold text-foreground mt-4 mb-1">
                Olá, {isLoading ? "..." : getFirstName(userData?.fullName) || "Usuário"}!
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
                Seja bem-vindo(a) ao seu painel de controle.
            </p>

            {isLoading ? (
                <div className="flex justify-center py-12">
                     <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    
                    {/* Linha Principal - Informações do Colaborador e Relógio */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* 1. Card Consolidado de Informações do Colaborador (Primary - lg:col-span-1) */}
                        <Card 
                            // Aplica a borda lateral e sombra
                            className={`lg:col-span-1 ${getThemeCardClasses('primary', true)}`}
                            onClick={handleDetailsCardClick} // Redireciona para /usuario
                            onKeyDown={getCardKeyDownHandler(handleDetailsCardClick)}
                            role="button"
                            aria-label="Abrir detalhes do colaborador"
                            tabIndex={0} 
                        >
                            <CardContent className="p-6 space-y-4">
                                
                                {/* Nome, Cargo e Botão Empresa (se for CTO) */}
                                <div className="flex items-center space-x-4 pb-2 border-b border-border/70">
                                    <User2 className="h-10 w-10 text-primary" />
                                    
                                    <div className="flex-1 min-w-0">
                                        {/* APLICAÇÃO DO FILTRO DE NOME */}
                                        <h2 className="text-xl font-bold text-foreground line-clamp-1">{getFirstName(userData?.fullName)}</h2>
                                         <h2 className="text-xl font-bold text-foreground line-clamp-1">{getSecondName(userData?.fullName)}</h2>
                                        
                                        <p className="text-sm font-semibold text-foreground/80">
                                            {userData?.jobPosition || "N/A"} 
                                            <span className="text-muted-foreground ml-1 font-normal">({getRoleDisplayName(userData?.role || '')})</span>
                                        </p>
                                    </div>
                                    
                                    {isCto && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="flex-shrink-0 text-primary hover:bg-primary/40"
                                            onClick={handleCompanyButtonClick} // Handler com stopPropagation
                                            title="Gerenciar Empresa"
                                        >
                                            <Briefcase className="w-4 h-4 mr-1" /> Empresa
                                        </Button>
                                    )}
                                </div>

                                {/* Detalhes Consolidados */}
                                <div className="space-y-3">
                                    <h3 className="text-base font-semibold text-muted-foreground">Detalhes Profissionais</h3>
                                    
                                    {/* Empresa (com clique se for CTO) */}
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building className="h-4 w-4 text-primary/80" />
                                        <span 
                                            className={`text-foreground font-medium ${isCto ? 'underline cursor-pointer hover:text-primary' : ''}`}
                                            onClick={handleCompanyLinkClick} // Handler com stopPropagation
                                            title={isCto ? "Clique para ir para a Empresa" : undefined}
                                        >
                                            {userData?.companyName || "N/A"}
                                        </span>
                                    </p>
                                    
                                    {/* Email */}
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4 text-primary/80" />
                                        <span className="text-foreground line-clamp-1">{userData?.email || "N/A"}</span>
                                    </p>
                                    
                                    {/* Telefone */}
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4 text-primary/80" />
                                        <span className="text-foreground">{formatPhone(userData?.phone) || "N/A"}</span>
                                    </p>
                                    
                                    {/* Salário (com Toggle) */}
                                    <div className="flex items-center gap-2 text-base text-muted-foreground pt-2">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        <span className="text-primary font-bold text-lg">
                                            {showSalary ? formatSalary(userData?.salary) : "R$ *****,**"}
                                        </span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-primary hover:bg-primary/40"
                                            onClick={(e) => {
                                                e.stopPropagation(); // IMPORTANTE: Impede o clique no card
                                                toggleSalary();
                                            }}
                                            title={showSalary ? "Ocultar Salário" : "Exibir Salário"}
                                        >
                                            {showSalary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Relógio (Clock) - Click para Relatório para TODOS */}
                        <Card 
                            // Aplica a borda lateral e sombra
                            className={`
                                lg:col-span-2 
                                ${getThemeCardClasses('primary', true)} 
                                flex flex-col justify-center
                            `}
                            onClick={handleClockCardClick}
                            onKeyDown={getCardKeyDownHandler(handleClockCardClick)}
                            role="button"
                            aria-label="Abrir relatório de ponto"
                            tabIndex={0} 
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-center">
                                    <ClockIcon className="h-8 w-8 mr-4 text-primary" />
                                    <h2 className="text-2xl font-bold text-foreground">Controle de Ponto Online</h2>
                                    <ArrowRight className="h-5 w-5 ml-4 text-primary/80" />
                                </div>
                                <div className="flex justify-center mt-4">
                                    <Clock /> 
                                </div>
                                <p className="text-center text-sm text-muted-foreground mt-4">Clique para acessar o Relatório Completo</p>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Linha de Notificações / Estatísticas (2 Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-6">
                        
                        {/* 1. Cartão de Novos Avisos (Yellow/Alert) */}
                        <Card 
                            className={`
                                ${getThemeCardClasses('yellow-600', !isManager && newWarnings.length > 0)}
                            `}
                            onClick={handleAvisosCardClick} 
                            onKeyDown={getCardKeyDownHandler(handleAvisosCardClick)}
                            role="button"
                            aria-label="Abrir avisos recentes"
                            tabIndex={0}
                        >
                            <CardContent className="p-5 flex flex-col h-full justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-muted-foreground">Novos Avisos</p>
                                    <MessageSquareWarning className={`h-6 w-6 ${newWarnings.length > 0 || isManager ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                                </div>
                                <p className={`text-4xl font-extrabold ${newWarnings.length > 0 ? 'text-yellow-600' : 'text-foreground/70'}`}>
                                    {newWarnings.length}
                                </p>
                                
                                {/* Links Condicionais para MANAGER */}
                                {isManager ? (
                                    <div className="mt-4 space-y-1">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full justify-start text-yellow-600 hover:bg-yellow-600/40"
                                            onClick={(e) => { e.stopPropagation(); navigate("/criar-aviso"); }}
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2" /> Criar Aviso
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full justify-start text-yellow-600 hover:bg-yellow-600/40"
                                            onClick={(e) => { e.stopPropagation(); handleWarningClick(); }} // Marca como visto e navega
                                        >
                                            <ListChecks className="w-4 h-4 mr-2" /> Ver Todos Avisos
                                        </Button>
                                    </div>
                                ) : newWarnings.length > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-2 -mx-3 justify-start text-yellow-600 hover:bg-yellow-600/40"
                                        onClick={handleAvisosCardClick} // Redireciona
                                    >
                                        Ver Avisos <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        
                      {/* 2. Cartão de Solicitações de Aprovação Pendentes (Destructive/Success) */}
                        {hasApprovalPermission ? (
                            <Card 
                                // Determina a cor com base na contagem total de pendências
                                className={`
                                    ${totalPendingCount > 0 ? getThemeCardClasses('destructive', true) : getThemeCardClasses('success', true)}
                                `}
                                // O clique geral no card é para Apuração de Horas
                                onClick={handleApprovalClick} 
                                onKeyDown={getCardKeyDownHandler(handleApprovalClick)}
                                role="button"
                                aria-label="Abrir apuração de horas"
                                tabIndex={0}
                            >
                                <CardContent className="p-5 flex flex-col h-full justify-between">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-muted-foreground">Total de Pendências</p>
                                        <AlertTriangle className={`h-6 w-6 ${totalPendingCount > 0 ? 'text-destructive' : 'text-green-600'}`} />
                                    </div>
                                    
                                    {/* Exibe a contagem TOTAL, estilizado como 4xl */}
                                    <p className={`text-4xl font-extrabold ${totalPendingCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                        {totalPendingCount}
                                    </p>
                                    
                                    <Separator className="my-3 bg-border/80" />
                                    
                                    {/* 3. LINKS CONSOLIDADOS COM CONTADOR AO LADO DO TEXTO (CORREÇÃO APLICADA AQUI) */}
                                    <div className="space-y-2">
                                        
                                        {/* Botão 1: Apuração de Horas */}
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className={`
                                                w-full justify-between pr-0 
                                                text-foreground hover:bg-primary/20
                                            `}
                                            onClick={(e) => { e.stopPropagation(); handleApprovalClick(); }}
                                        >
                                            {/* Rótulo e Ícone */}
                                            <div className="flex items-center text-sm font-medium text-foreground">
                                                <ListChecks className="w-4 h-4 mr-2 text-primary" /> Solicitação de ajuste no Ponto
                                            </div>
                                            {/* Contador */}
                                            <span 
                                                className={`text-sm font-extrabold px-3 py-1 rounded-full ${pendingApprovalsCount > 0 ? 'bg-destructive text-white' : 'bg-primary/20 text-foreground'}`}
                                            >
                                                {pendingApprovalsCount}
                                            </span>
                                        </Button>
                                        
                                        {/* Botão 2: Gestão de Férias */}
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className={`
                                                w-full justify-between pr-0
                                                text-foreground hover:bg-primary/20
                                            `}
                                            onClick={(e) => { e.stopPropagation(); handleVacationApprovalClick(); }}
                                        >
                                            {/* Rótulo e Ícone */}
                                            <div className="flex items-center text-sm font-medium text-foreground">
                                                <Plane className="w-4 h-4 mr-2 text-primary" /> Solicitação de Férias
                                            </div>
                                            {/* Contador */}
                                            <span 
                                                className={`text-sm font-extrabold px-3 py-1 rounded-full ${pendingVacationCount > 0 ? 'bg-destructive text-white' : 'bg-primary/20 text-foreground'}`}
                                            >
                                                {pendingVacationCount}
                                            </span>
                                        </Button>
                                        
                                        {/* NOVO: Botão 3: Solicitação de Abono */}
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className={`
                                                w-full justify-between pr-0
                                                text-foreground hover:bg-primary/20
                                            `}
                                            onClick={(e) => { e.stopPropagation(); handleTimeOffApprovalClick(); }}
                                        >
                                            {/* Rótulo e Ícone */}
                                            <div className="flex items-center text-sm font-medium text-foreground">
                                                <Activity className="w-4 h-4 mr-2 text-primary" /> Solicitação de ajuste de manual
                                            </div>
                                            {/* Contador */}
                                            <span 
                                                className={`text-sm font-extrabold px-3 py-1 rounded-full ${pendingTimeOffCount > 0 ? 'bg-destructive text-white' : 'bg-primary/20 text-foreground'}`}
                                            >
                                                {pendingTimeOffCount}
                                            </span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            /* Card de Acesso Rápido */
                             <Card
                               className={getThemeCardClasses('primary', true)}
                               onClick={() => navigate("/meus-documentos")}
                               onKeyDown={getCardKeyDownHandler(() => navigate("/meus-documentos"))}
                               role="button"
                               aria-label="Abrir acesso rápido para meus documentos"
                               tabIndex={0}
                             >
                                <CardContent className="p-5 space-y-3 flex flex-col items-start h-full justify-center">
                                    <div className="flex items-center text-primary mb-3">
                                        <Zap className="h-6 w-6 mr-2" />
                                        <p className="text-base font-bold text-foreground">Acesso Rápido</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start text-primary hover:bg-primary/40"
                                        onClick={(e) => { e.stopPropagation(); navigate("/enviar-documento-colaborador"); }}
                                    >
                                        <FileCheck className="w-4 h-4 mr-2 text-foreground " /> Enviar Documentos
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start text-primary hover:bg-primary/40"
                                        onClick={(e) => { e.stopPropagation(); navigate("/solicitar-ferias"); }}
                                    >
                                        <TreePalm className="w-4 h-4 mr-2 text-foreground" /> Solicitar Férias
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start text-primary hover:bg-primary/40"
                                        onClick={(e) => { e.stopPropagation(); navigate("/solicitar-abono"); }}
                                    >
                                        <TimerReset className="w-4 h-4 mr-2 text-foreground" /> Solicitar Abono de Horas
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
          </div>
    </PageShell>
  );
};

export default Dashboard;
