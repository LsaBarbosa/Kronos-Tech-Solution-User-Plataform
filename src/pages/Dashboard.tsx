import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Clock from "@/components/Clock";
import EmployeeBadge from "@/components/EmployeeBadge"; // Componente existente para exibir o perfil
import { Bell, MessageSquareWarning, ArrowRight, Loader2, Clock as ClockIcon, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 💡 NOVO: Importa o hook customizado com toda a lógica
import { useDashboardData } from "@/hooks/useDashboardData";
// 💡 NOVO: Importa utilitários de tipo
import { getRoleDisplayName } from "@/types/dashboard";

const Dashboard = () => {
  // 💡 Estado de UI (Sidebar) é o único estado mantido localmente
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const navigate = useNavigate();

  // 💡 HOOK: Toda a lógica de estado, API e notificações
  const {
    userData,
    isLoading,
    pendingApprovalsCount,
    newWarnings,
    hasApprovalPermission,
    fetchProfile, // Passado para o EmployeeBadge para re-fetch
    handleWarningClick,
  } = useDashboardData();
  
  // Função para navegar para as aprovações pendentes
  const handleApprovalClick = () => {
    navigate("/pending-approvals");
  };

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
                    {/* Linha de Notificações */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Cartão de Perfil Rápido */}
                        <Card className="bg-gradient-to-r from-primary to-primary/80 text-white shadow-xl transform hover:scale-[1.01] transition-transform duration-300">
                            <CardContent className="p-5 space-y-2">
                                <CardTitle className="text-2xl font-bold">
                                    {userData?.companyName || "Empresa Desconhecida"}
                                </CardTitle>
                                <p className="text-sm font-medium opacity-80">
                                    {getRoleDisplayName(userData?.role || '')}
                                </p>
                                <div className="pt-2">
                                    <p className="text-xs font-light">Último Acesso:</p>
                                    <p className="text-sm font-semibold">
                                        {new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Cartão de Aprovações Pendentes (Somente para Manager/Admin) */}
                        {hasApprovalPermission && (
                            <Card 
                                className={`shadow-xl transition-shadow ${pendingApprovalsCount > 0 ? 'border-l-4 border-l-destructive cursor-pointer hover:shadow-2xl' : 'border-l-4 border-l-success'}`}
                                onClick={pendingApprovalsCount > 0 ? handleApprovalClick : undefined}
                            >
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Aprovações Pendentes</p>
                                        <p className={`text-3xl font-extrabold ${pendingApprovalsCount > 0 ? 'text-destructive' : 'text-success'}`}>
                                            {pendingApprovalsCount}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${pendingApprovalsCount > 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                                        <FileCheck className={`h-6 w-6 ${pendingApprovalsCount > 0 ? 'text-destructive' : 'text-success'}`} />
                                    </div>
                                </CardContent>
                                {pendingApprovalsCount > 0 && (
                                    <div className="flex justify-end p-2 pt-0">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={handleApprovalClick}
                                        >
                                            Revisar <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        )}
                        
                        {/* Cartão de Novos Avisos */}
                        <Card 
                            className={`shadow-xl transition-shadow ${newWarnings.length > 0 ? 'border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-2xl' : 'border-l-4 border-l-muted-foreground'}`}
                            onClick={newWarnings.length > 0 ? handleWarningClick : undefined} // 💡 Handler do hook
                        >
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Novos Avisos</p>
                                    <p className={`text-3xl font-extrabold ${newWarnings.length > 0 ? 'text-yellow-600' : 'text-foreground'}`}>
                                        {newWarnings.length}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${newWarnings.length > 0 ? 'bg-yellow-100 dark:bg-yellow-600/20' : 'bg-muted/50'}`}>
                                    <Bell className={`h-6 w-6 ${newWarnings.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                                </div>
                            </CardContent>
                             {newWarnings.length > 0 && (
                                <div className="flex justify-end p-2 pt-0">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-yellow-600 hover:bg-yellow-600/10"
                                        onClick={handleWarningClick}
                                    >
                                        Ver Avisos <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Badge de Perfil Detalhado e Relógio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                        <Card className="md:col-span-1 lg:col-span-1 border-l-4 border-l-secondary shadow-lg">
                            {/* EmployeeBadge (Componente existente para detalhes do perfil) */}
                            <EmployeeBadge
                                userData={userData}
                                isLoading={isLoading}
                                onUpdateSuccess={fetchProfile}
                            />
                        </Card>
                        
                        <Card className="md:col-span-1 lg:col-span-2 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-center">
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
