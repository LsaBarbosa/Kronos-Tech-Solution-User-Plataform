// src/pages/Dashboard.tsx

import { useState, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Clock from "@/components/Clock";
import { 
    ArrowRight, Loader2, Clock as ClockIcon, FileCheck, DollarSign, Mail, 
    Briefcase, Phone, MessageSquareWarning, Zap, User2, Building, Eye, EyeOff, 
    PlusCircle, ListChecks, ActivitySquare 
} from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useDashboardData } from "@/hooks/useDashboardData";
import { getRoleDisplayName } from "@/types/dashboard";

// Função utilitária para formatar o salário (Mantida)
const formatSalary = (salary: number | undefined) => {
    if (salary === undefined || salary === null) return "N/A";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(salary);
};

// Função utilitária para formatar o telefone (Mantida)
const formatPhone = (phone: string | undefined) => {
    if (!phone) return "N/A";
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    const matchShort = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
     if (matchShort) {
      return `(${matchShort[1]}) ${matchShort[2]}-${matchShort[3]}`;
    }
    return phone;
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleSalary = useCallback(() => setShowSalary(prev => !prev), []);
  
  const navigate = useNavigate();

  const {
    userData,
    isLoading,
    pendingApprovalsCount,
    newWarnings,
    hasApprovalPermission,
    fetchProfile, 
    // handleWarningClick (mantida a função que deve navegar para /avisos)
  } = useDashboardData();
  
  // Handlers de Navegação
  const handleApprovalClick = useCallback(() => {
    navigate("/apuracao-horas"); 
  }, [navigate]);

  const handleClockClick = useCallback(() => {
    navigate("/relatorio-detalhado"); 
  }, [navigate]);

  // Handler para o clique no Card de Detalhes (leva para /usuario)
  const handleDetailsCardClick = useCallback(() => {
    navigate("/usuario");
  }, [navigate]);

  // Handler para o Card de Avisos para não-MANAGERs
  const handleAvisosCardClick = useCallback(() => {
    if (!isManager && newWarnings.length > 0) {
        navigate("/avisos"); // Assumindo que a rota "/avisos" é o destino para a lista completa
    }
  }, [navigate, newWarnings.length]);


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

  /**
   * 💡 Função auxiliar para aplicar estilização temática de Card.
   * Mantém a coerência visual de bordas, sombras e hover.
   * @param baseColor Cor base ('primary', 'destructive', 'success', 'yellow-600').
   */
  const getThemeCardClasses = (baseColor: string, isClickable: boolean = false) => {
      // Classes base de sombra e transição para o efeito de hover
      const hoverClasses = `shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`;
      
      let borderColor, ringColor;

      switch (baseColor) {
          case 'primary':
              borderColor = 'border-l-primary';
              ringColor = 'ring-primary';
              break;
          case 'destructive':
              borderColor = 'border-l-destructive';
              ringColor = 'ring-destructive';
              break;
          case 'success':
              // Usando green-600 como sucesso
              borderColor = 'border-l-green-600';
              ringColor = 'ring-green-600';
              break;
          case 'yellow-600':
              // Cor de aviso/alerta (amarelo)
              borderColor = 'border-l-yellow-600';
              ringColor = 'ring-yellow-600';
              break;
          default:
              borderColor = 'border-l-border';
              ringColor = 'ring-primary';
      }
      
      const cursorClass = isClickable ? 'cursor-pointer' : 'cursor-default';
      
      return `${borderColor} ${hoverClasses} hover:ring-2 hover:${ringColor}/50 ${cursorClass}`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 pt-20">
          <div className="max-w-6xl mx-auto">
            
            {/* SAUDAÇÃO PERSONALIZADA */}
            <h1 className="text-3xl font-bold text-foreground mb-1">
                Olá, {isLoading ? "..." : userData?.fullName.split(' ')[0] || "Usuário"}!
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
                        
                        {/* Card Consolidado de Informações do Colaborador (1/3) - AGORA CLICÁVEL */}
                        <Card 
                            className={`
                                lg:col-span-1 
                                ${getThemeCardClasses('primary', true)}
                            `}
                            onClick={handleDetailsCardClick} // Redireciona para /usuario
                        >
                            <CardContent className="p-6 space-y-4">
                                
                                {/* Nome, Cargo e Botão Empresa (se for CTO) */}
                                <div className="flex items-center space-x-4 pb-2 border-b border-border/70">
                                    <User2 className="h-10 w-10 text-primary" />
                                    
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-foreground line-clamp-1">{userData?.fullName || "Colaborador"}</h2>
                                        <p className="text-sm font-semibold text-foreground/80">
                                            {userData?.jobPosition || "N/A"} 
                                            <span className="text-muted-foreground ml-1 font-normal">({getRoleDisplayName(userData?.role || '')})</span>
                                        </p>
                                    </div>
                                    
                                    {isCto && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="flex-shrink-0 text-primary hover:bg-primary/10"
                                            onClick={handleCompanyButtonClick} // Chama o handler com stopPropagation
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
                                            onClick={handleCompanyLinkClick} // Chama o handler com stopPropagation
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
                                            className="h-7 w-7 text-primary hover:bg-primary/10"
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
                            className={`
                                lg:col-span-2 
                                ${getThemeCardClasses('primary', true)} 
                                flex flex-col justify-center
                            `}
                            onClick={handleClockClick}
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
                            // NOVO: Clique no card para não-MANAGERs leva para /avisos se houver avisos
                            onClick={handleAvisosCardClick} 
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
                                            className="w-full justify-start text-yellow-600 hover:bg-yellow-600/10"
                                            onClick={(e) => { e.stopPropagation(); navigate("/criar-aviso"); }}
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2" /> Criar Aviso
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="w-full justify-start text-yellow-600 hover:bg-yellow-600/10"
                                            onClick={(e) => { e.stopPropagation(); navigate("/avisos"); }} // Navega para a lista de avisos
                                        >
                                            <ListChecks className="w-4 h-4 mr-2" /> Ver Todos Avisos
                                        </Button>
                                    </div>
                                ) : newWarnings.length > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-2 -mx-3 justify-start text-yellow-600 hover:bg-yellow-600/10"
                                        onClick={handleAvisosCardClick} // O clique do botão também usa a navegação simples
                                    >
                                        Ver Avisos <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* 2. Cartão de Solicitações de Aprovação Pendentes (Destructive/Success) OU Acesso Rápido */}
                        {hasApprovalPermission ? (
                            <Card 
                                className={`
                                    ${pendingApprovalsCount > 0 ? getThemeCardClasses('destructive', !isManager) : getThemeCardClasses('success', !isManager)}
                                `}
                                // Apenas roles que não são MANAGER e que têm aprovações pendentes podem clicar aqui.
                                onClick={!isManager && pendingApprovalsCount > 0 ? handleApprovalClick : undefined}
                            >
                                <CardContent className="p-5 flex flex-col h-full justify-between">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-muted-foreground">Solicitações de Aprovação</p>
                                        <FileCheck className={`h-6 w-6 ${pendingApprovalsCount > 0 ? 'text-destructive' : 'text-green-600'}`} />
                                    </div>
                                    <p className={`text-4xl font-extrabold ${pendingApprovalsCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                        {pendingApprovalsCount}
                                    </p>
                                    
                                    {/* Links Condicionais para MANAGER */}
                                    {isManager ? (
                                        <div className="mt-4 space-y-1">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={`w-full justify-start ${pendingApprovalsCount > 0 ? 'text-destructive hover:bg-destructive/10' : 'text-green-600 hover:bg-green-600/10'}`}
                                                onClick={(e) => { e.stopPropagation(); handleApprovalClick(); }}
                                            >
                                                 <ListChecks className="w-4 h-4 mr-2" /> Apuração de Horas
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full justify-start text-primary hover:bg-primary/10"
                                                onClick={(e) => { e.stopPropagation(); navigate("/status-do-registro"); }}
                                            >
                                                <ActivitySquare className="w-4 h-4 mr-2" /> Status do Registro
                                            </Button>
                                        </div>
                                    ) : pendingApprovalsCount > 0 && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="mt-2 -mx-3 justify-start text-destructive hover:bg-destructive/10"
                                            onClick={handleApprovalClick}
                                        >
                                            Revisar <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    )}
                                    {pendingApprovalsCount === 0 && !isManager && (
                                         <p className="text-sm font-medium text-muted-foreground mt-2">
                                            Tudo aprovado!
                                         </p>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            /* Card de Acesso Rápido (para quem não tem permissão de aprovação e não é manager) */
                             <Card className={getThemeCardClasses('primary')}>
                                <CardContent className="p-5 space-y-3 flex flex-col items-start h-full justify-center">
                                    <div className="flex items-center text-primary mb-3">
                                        <Zap className="h-6 w-6 mr-2" />
                                        <p className="text-base font-bold text-primary">Acesso Rápido</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start text-primary hover:bg-primary/10"
                                        onClick={() => navigate("/meus-documentos")}
                                    >
                                        <FileCheck className="w-4 h-4 mr-2" /> Meus Documentos
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full justify-start text-primary hover:bg-primary/10"
                                        onClick={() => navigate("/relatorio")}
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2" /> Meu Relatório
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;