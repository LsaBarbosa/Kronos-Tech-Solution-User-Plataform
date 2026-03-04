// src/components/Sidebar.tsx

import { 
  X, Home, BarChart3, ChevronDown, ChevronRight, User, Shield, Users, 
  Clock, FilePlus, LogOut, UserCheck, UserPlus, Folder, FolderOpen, 
  Calculator, ClipboardCheck, Building2, BellMinus, TreePalm, TimerReset, Activity,
  // Novos ícones importados:
  FileText, Scale, FileCode, FileSignature, BadgeCheck,
  CalendarRange,
  Scale3d,
  ScaleIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/service/auth.Service";
import { clearLocalAuthSession } from "@/lib/auth-session";
import { FiscalService } from "@/service/fiscal.service"; // Ajuste o caminho conforme criou o arquivo acima
import { useToast } from "@/components/ui/use-toast"; // Assumindo que você tem um toast (opcional)
import { useSessionUser } from "@/hooks/useSessionUser";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void; 
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [documentosOpen, setDocumentosOpen] = useState(false);
  const [administradorOpen, setAdministradorOpen] = useState(false);
  const [colaboradoresOpen, setColaboradoresOpen] = useState(false);
  const [folhaDePontoOpen, setFolhaDePontoOpen] = useState(false);
  const [adminVacationOpen, setAdminVacationOpen] = useState(false);
  const [adminTimeOffOpen, setAdminTimeOffOpen] = useState(false);
  // 🆕 Estado para o novo subgrupo Auditoria
  const [auditoriaOpen, setAuditoriaOpen] = useState(false);
  
  const navigate = useNavigate();
  const { sessionUser } = useSessionUser();
  const { toast } = useToast(); // Opcional, apenas para feedback visual

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUserRole(decoded?.role || "");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Falha ao encerrar sessão no servidor", error);
      toast({
        title: "Sessão encerrada localmente",
        description: "Não foi possível confirmar o logout no servidor.",
        variant: "destructive",
      });
    } finally {
      clearLocalAuthSession();
      navigate("/login", { replace: true });
      toggleSidebar();
    }
  };

  const userRole = sessionUser?.role || "";
  const isManager = userRole === "MANAGER";
  const isCto = userRole === "CTO";

  // --- Funções Auxiliares de Download ---
  const getCurrentMonthDates = () => {
    const date = new Date();
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    return { startDate, endDate };
  };

  const handleDownloadMirror = async () => {
    try {
      const { startDate, endDate } = getCurrentMonthDates();
      toast({ title: "Gerando Espelho...", description: "O download iniciará em breve." });
      await FiscalService.downloadMirror(startDate, endDate);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao baixar espelho de ponto." });
    }
  };

  const handleDownloadAfd = async () => {
    try {
      toast({ title: "Gerando AFD...", description: "Isso pode levar alguns segundos." });
      await FiscalService.downloadAfd();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao baixar AFD." });
    }
  };

  const handleDownloadAej = async () => {
    try {
      const { startDate, endDate } = getCurrentMonthDates();
      toast({ title: "Gerando AEJ Assinado...", description: "Verificando assinatura digital." });
      await FiscalService.downloadAej(startDate, endDate);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao baixar AEJ." });
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      toast({ title: "Baixando Atestado...", description: "Obtendo documento assinado." });
      await FiscalService.downloadTechnicalCertificate();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao baixar Atestado Técnico." });
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-80 bg-background border-r border-border shadow-xl transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 flex-1 space-y-2 flex flex-col h-full overflow-y-auto">
          <div className="space-y-2">
            
            {/* Início */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => { navigate("/dashboard"); toggleSidebar(); }}
            >
              <Home className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Início</span>
            </Button>

            {/* Relatório de Horas */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => { navigate("/relatorio-detalhado"); toggleSidebar(); }}
            >
              <BarChart3 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Relatório de Horas</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => { navigate("/espelho-ponto"); toggleSidebar(); }}
            >
              <CalendarRange className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Espelho de Ponto</span>
            </Button>
       
       
            {/* Usuário */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => { navigate("/usuario"); toggleSidebar(); }}
            >
              <User className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Usuário</span>
            </Button>

            {/* Empresa (CTO) */}
            {isCto && (
              <Button
                variant="ghost"
                className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                onClick={() => { navigate("/empresa"); toggleSidebar(); }}
              >
                <Building2 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                <span className="font-medium sidebar-text-sm">Empresa</span>
              </Button>
            )}

            {/* Ações Rápidas (Férias, Manual, Avisos) */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => { navigate("/solicitar-ferias"); toggleSidebar(); }}
            >
              <TreePalm className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Férias</span>
            </Button>
             
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => { navigate("/solicitar-Abono"); toggleSidebar(); }}
            >
              <TimerReset className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Registro Manual</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => { navigate("/avisos"); toggleSidebar(); }}
            >
              <BellMinus className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Mural de Avisos</span>
            </Button>

            {/* Documentos */}
            <Collapsible open={documentosOpen} onOpenChange={setDocumentosOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                >
                  <Folder className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                  <span className="font-medium flex-1 sidebar-text-sm">Documentos</span>
                  {documentosOpen ? (
                    <ChevronDown className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronRight className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => { navigate("/documentos"); toggleSidebar(); }}
                >
                  <FolderOpen className="mr-2 sidebar-icon-xs" />
                  <span>Buscar Documentos</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => { navigate("/enviar-documento-colaborador"); toggleSidebar(); }}
                >
                  <FilePlus className="mr-2 sidebar-icon-xs" />
                  <span>Enviar Documentos</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>


            {/* Administrador (Somente visível para MANAGER) */}
            {isManager && (
              <Collapsible open={administradorOpen} onOpenChange={setAdministradorOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                  >
                    <Shield className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                    <span className="font-medium flex-1 sidebar-text-sm">Administrador</span>
                    {administradorOpen ? (
                      <ChevronDown className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <ChevronRight className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  
                  {/* 7.1 Colaboradores */}
                  <Collapsible open={colaboradoresOpen} onOpenChange={setColaboradoresOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        <Users className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Colaboradores</span>
                        {colaboradoresOpen ? (
                          <ChevronDown className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => { navigate("/lista-colaboradores"); toggleSidebar(); }}
                      >
                        <UserCheck className="mr-2 sidebar-icon-xxs" />
                        <span>Lista de Colaboradores</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => { navigate("/criar-colaborador"); toggleSidebar(); }}
                      >
                        <UserPlus className="mr-2 sidebar-icon-xxs" />
                        <span>Criar Colaborador</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 7.2 Folha de Ponto */}
                  <Collapsible open={folhaDePontoOpen} onOpenChange={setFolhaDePontoOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        <Clock className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Folha de Ponto</span>
                        {folhaDePontoOpen ? (
                          <ChevronDown className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => { navigate("/apuracao-horas"); toggleSidebar(); }}
                      >
                        <Calculator className="mr-2 sidebar-icon-xxs" />
                        <span>Apuração de Horas</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => { navigate("/status-do-registro"); toggleSidebar(); }}
                      >
                        <ClipboardCheck className="mr-2 sidebar-icon-xxs" />
                        <span>Status do Registro</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 7.3 Férias Admin */}
                  <Collapsible open={adminVacationOpen} onOpenChange={setAdminVacationOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        <TreePalm className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Férias</span>
                        {adminVacationOpen ? (
                          <ChevronDown className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => { navigate("/ferias"); toggleSidebar(); }}
                      >
                        <TreePalm className="mr-2 sidebar-icon-xxs" />
                        <span>Gestão de Férias</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 7.4 Registro Manual Admin */}
                  <Collapsible open={adminTimeOffOpen} onOpenChange={setAdminTimeOffOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        <TimerReset className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Registro Manual</span>
                        {adminTimeOffOpen ? (
                          <ChevronDown className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => { navigate("/aprovacoes-abono"); toggleSidebar(); }}
                      >
                        <Activity className="mr-2 sidebar-icon-xxs" />
                        <span>Gestão de Horas Manuais</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 🆕 7.5 AUDITORIA (Subgrupo Fiscal) */}
                  <Collapsible open={auditoriaOpen} onOpenChange={setAuditoriaOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        <Scale className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Auditoria Fiscal</span>
                        {auditoriaOpen ? (
                          <ChevronDown className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                       <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => { navigate("/auditoria"); toggleSidebar(); }}
                      >
                        <ScaleIcon className="mr-2 sidebar-icon-xxs" />
                        <span>Auditoria</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
        
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Sair */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;