// src/pages/Dashboard.tsx

import { useState, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Clock from "@/components/Clock";
import EmployeeBadge from "@/components/EmployeeBadge"; 
import { Bell, ArrowRight, Loader2, Clock as ClockIcon, FileCheck, DollarSign, Mail, Briefcase, Phone, MessageSquareWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useDashboardData } from "@/hooks/useDashboardData";
import { getRoleDisplayName } from "@/types/dashboard";

// Função utilitária para formatar o salário
const formatSalary = (salary: number | undefined) => {
    if (salary === undefined || salary === null) return "N/A";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(salary);
};

// Função utilitária para formatar o telefone
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
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
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
  
  const handleApprovalClick = useCallback(() => {
    navigate("/apuracao-horas"); 
  }, [navigate]);

  // Lógica para verificar a role CTO
  const isCto = useMemo(() => userData?.role === 'CTO', [userData?.role]);

  // Handler para o card da empresa
  const handleCompanyClick = useCallback(() => {
    if (isCto) {
      navigate("/empresa");
    }
  }, [isCto, navigate]);

  // 💡 ESTILIZAÇÃO APERFEIÇOADA DOS CARDS: HOVER, SOMBRAS E CORES TEMA
  const cardCompanyClasses = isCto 
    ? "cursor-pointer transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-primary/50 hover:scale-[1.01]"
    : "transition-all duration-300 hover:shadow-xl hover:ring-1 hover:ring-primary/30";

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 pt-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-4">
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
                    
                    {/* Linha de Notificações / Estatísticas (4 Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* 1. Card Empresa / Cargo (Primary) */}
                        <Card 
                            className={`shadow-xl border-l-4 border-l-primary bg-gradient-to-tr from-card to-primary/5 ${cardCompanyClasses}`}
                            onClick={handleCompanyClick} 
                            title={isCto ? "Clique para gerenciar a Empresa" : "Informações da Empresa"}
                        >
                            <CardContent className="p-5 space-y-3 h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-6 w-6 text-primary drop-shadow-md" />
                                    <p className="text-sm font-medium text-muted-foreground">Empresa / Cargo</p>
                                </div>
                                <h2 className="text-2xl font-extrabold line-clamp-1 text-foreground">
                                    {userData?.companyName || "N/A"}
                                </h2>
                                <p className="text-sm text-primary font-semibold pt-1">
                                    {userData?.jobPosition || "N/A"} 
                                    <span className="text-muted-foreground ml-1 font-normal">({getRoleDisplayName(userData?.role || '')})</span>
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* 2. Card Salário / Contato (Secondary) */}
                        <Card className="shadow-xl border-l-4 border-l-secondary bg-gradient-to-tr from-card to-secondary/5 transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-secondary/50 hover:scale-[1.01]">
                            <CardContent className="p-5 space-y-2 h-full flex flex-col justify-between">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-6 w-6 text-secondary drop-shadow-md" />
                                    <p className="text-sm font-medium text-muted-foreground">Salário / Contato</p>
                                </div>
                                <div className="text-2xl font-extrabold text-foreground">
                                    {formatSalary(userData?.salary)}
                                </div>
                                <Separator className="bg-border/50" />
                                <div className="space-y-1 text-sm">
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span className="text-foreground text-xs line-clamp-1">{userData?.email || "N/A"}</span>
                                    </p>
                                    <p className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span className="text-foreground text-xs">{formatPhone(userData?.phone) || "N/A"}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Cartão de Novos Avisos (Yellow Accent) */}
                        {/* Usa text-yellow-600 para manter a cor de alerta usada em Avisos.tsx */}
                        <Card 
                            className={`shadow-xl border-l-4 transition-all duration-300 h-full flex flex-col justify-between 
                                ${newWarnings.length > 0 
                                    ? 'border-l-yellow-600 cursor-pointer bg-gradient-to-tr from-card to-yellow-600/5 hover:shadow-2xl hover:ring-2 hover:ring-yellow-600/50 hover:scale-[1.01]' 
                                    : 'border-l-muted-foreground/50 bg-card hover:shadow-md hover:ring-1 hover:ring-muted-foreground/30'}`
                            }
                            onClick={newWarnings.length > 0 ? handleWarningClick : undefined} 
                        >
                            <CardContent className="p-5 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-muted-foreground">Novos Avisos</p>
                                        <MessageSquareWarning 
                                            className={`h-6 w-6 drop-shadow-md 
                                                ${newWarnings.length > 0 ? 'text-yellow-600 animate-pulse' : 'text-muted-foreground'}`
                                            } 
                                        />
                                    </div>
                                    <p className={`text-4xl font-extrabold 
                                        ${newWarnings.length > 0 ? 'text-yellow-600' : 'text-foreground/50'}`
                                    }>
                                        {newWarnings.length}
                                    </p>
                                </div>
                                 {newWarnings.length > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-2 -mx-3 justify-start text-yellow-600 font-semibold hover:bg-yellow-600/10"
                                        onClick={handleWarningClick}
                                    >
                                        Ver Avisos <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* 4. Cartão de Solicitações de Aprovação Pendentes (Destructive/Success) */}
                        {hasApprovalPermission ? (
                            <Card 
                                className={`shadow-xl border-l-4 transition-all duration-300 h-full flex flex-col justify-between 
                                    ${pendingApprovalsCount > 0 
                                        ? 'border-l-destructive cursor-pointer bg-gradient-to-tr from-card to-destructive/5 hover:shadow-2xl hover:ring-2 hover:ring-destructive/50 hover:scale-[1.01]' 
                                        : 'border-l-success bg-gradient-to-tr from-card to-success/5 hover:shadow-xl hover:ring-1 hover:ring-success/50'}`
                                }
                                onClick={pendingApprovalsCount > 0 ? handleApprovalClick : undefined}
                            >
                                <CardContent className="p-5 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-medium text-muted-foreground">Solicitações de Aprovação</p>
                                            <FileCheck 
                                                className={`h-6 w-6 drop-shadow-md 
                                                    ${pendingApprovalsCount > 0 ? 'text-destructive animate-pulse' : 'text-success'}`
                                                } 
                                            />
                                        </div>
                                        <p className={`text-4xl font-extrabold 
                                            ${pendingApprovalsCount > 0 ? 'text-destructive' : 'text-success'}`
                                        }>
                                            {pendingApprovalsCount}
                                        </p>
                                    </div>
                                    {pendingApprovalsCount > 0 && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="mt-2 -mx-3 justify-start text-destructive font-semibold hover:bg-destructive/10"
                                            onClick={handleApprovalClick}
                                        >
                                            Revisar <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    )}
                                     {pendingApprovalsCount === 0 && (
                                        <span className="text-sm text-success font-semibold mt-2">
                                            Tudo em ordem!
                                        </span>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            /* Slot de Preenchimento (Clock) se o card de aprovação não for exibido */
                             <Card className="shadow-lg border-l-4 border-l-primary/30 bg-card/80 transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30">
                                <CardContent className="p-5 space-y-3 flex items-center justify-center h-full flex-col">
                                    <ClockIcon className="h-8 w-8 text-primary/50" />
                                    <p className="text-sm font-medium text-muted-foreground text-center">
                                        Seu Painel de Ponto
                                    </p>
                                     <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="text-primary hover:text-primary/80"
                                        onClick={() => navigate("/relatorio-detalhado")}
                                    >
                                        Ver Relatórios
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Linha de Perfil Detalhado e Relógio */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                        {/* EmployeeBadge (Componente de Perfil e Edição) */}
                        <div className="lg:col-span-1">
                            <EmployeeBadge
                                userData={userData}
                                isLoading={isLoading}
                                onUpdateSuccess={fetchProfile}
                            />
                        </div>
                        
                        {/* Relógio (Primary) */}
                        <Card className="lg:col-span-2 shadow-xl border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/10 transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-primary/50 hover:scale-[1.005]">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-center mb-4">
                                    <ClockIcon className="h-8 w-8 mr-4 text-primary" />
                                    <h2 className="text-2xl font-bold text-foreground">Horário Atual</h2>
                                </div>
                                <div className="flex justify-center mt-4">
                                    <Clock />
                                </div>
                            </CardContent>
                        </Card>
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