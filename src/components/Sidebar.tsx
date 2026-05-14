// src/components/Sidebar.tsx

import { 
  X, Home, BarChart3, ChevronDown, ChevronRight, User, Shield, Users, 
  Clock, FilePlus, LogOut, UserCheck, UserPlus, Folder, FolderOpen, 
  Calculator, ClipboardCheck, Building2, BellMinus, TreePalm, TimerReset, Activity,
  CalendarRange, Scale, ScaleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_MENU_GROUPS, APP_PATHS, APP_ROUTE_META, type AppRole, type AppRouteMeta } from "@/config/app-routes";

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
  const { logout, role } = useAuth();
  const goTo = (path: string) => {
    navigate(path);
    toggleSidebar();
  };

  const handleLogout = async () => {
    await logout();
    navigate(APP_PATHS.login, { replace: true });
    toggleSidebar();
  };

  const isCto = role === "CTO";
  const currentRole = role as AppRole | "";
  const canAccessRoute = (route: AppRouteMeta) =>
    !route.allowedRoles || (currentRole ? route.allowedRoles.includes(currentRole) : false);
  const canAccessAdminMenu = Object.values(ADMIN_MENU_GROUPS)
    .flat()
    .some(canAccessRoute);

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
            aria-label="Fechar menu lateral"
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
              onClick={() => goTo(APP_PATHS.dashboard)}
            >
              <Home className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">{APP_ROUTE_META.dashboard.label}</span>
            </Button>

            {/* Relatório de Horas */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => goTo(APP_PATHS.relatorioDetalhado)}
            >
              <BarChart3 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">{APP_ROUTE_META.relatorioDetalhado.label}</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => goTo(APP_PATHS.espelhoPonto)}
            >
              <CalendarRange className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">{APP_ROUTE_META.espelhoPonto.label}</span>
            </Button>
       
       
            {/* Usuário */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => goTo(APP_PATHS.usuario)}
            >
              <User className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">{APP_ROUTE_META.usuario.label}</span>
            </Button>

            {/* Empresa (CTO) */}
            {isCto && (
              <Button
                variant="ghost"
                className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                onClick={() => goTo(APP_PATHS.empresa)}
              >
                <Building2 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                <span className="font-medium sidebar-text-sm">{APP_ROUTE_META.empresa.label}</span>
              </Button>
            )}

            {/* Ações Rápidas (Férias, Manual, Avisos) */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => goTo(APP_PATHS.solicitarFerias)}
            >
              <TreePalm className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">{APP_ROUTE_META.solicitarFerias.label}</span>
            </Button>
             
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => goTo(APP_PATHS.solicitarAbono)}
            >
              <TimerReset className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">{APP_ROUTE_META.solicitarAbono.label}</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => goTo(APP_PATHS.avisos)}
            >
              <BellMinus className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">{APP_ROUTE_META.avisos.label}</span>
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
                  onClick={() => goTo(APP_PATHS.documentos)}
                >
                  <FolderOpen className="mr-2 sidebar-icon-xs" />
                  <span>{APP_ROUTE_META.documentos.label}</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => goTo(APP_PATHS.enviarDocumentoColaborador)}
                >
                  <FilePlus className="mr-2 sidebar-icon-xs" />
                  <span>{APP_ROUTE_META.enviarDocumentoColaborador.label}</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>


            {/* Administrador: os subgrupos usam APP_ROUTE_META como fonte de verdade de RBAC. */}
            {canAccessAdminMenu && (
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
                  {canAccessRoute(APP_ROUTE_META.listaColaboradores) && (
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
                        onClick={() => goTo(APP_PATHS.listaColaboradores)}
                      >
                        <UserCheck className="mr-2 sidebar-icon-xxs" />
                        <span>{APP_ROUTE_META.listaColaboradores.label}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => goTo(APP_PATHS.criarColaborador)}
                      >
                        <UserPlus className="mr-2 sidebar-icon-xxs" />
                        <span>{APP_ROUTE_META.criarColaborador.label}</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                  )}

                  {/* 7.2 Folha de Ponto */}
                  {canAccessRoute(APP_ROUTE_META.apuracaoHoras) && (
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
                        onClick={() => goTo(APP_PATHS.apuracaoHoras)}
                      >
                        <Calculator className="mr-2 sidebar-icon-xxs" />
                        <span>{APP_ROUTE_META.apuracaoHoras.label}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => goTo(APP_PATHS.statusDoRegistro)}
                      >
                        <ClipboardCheck className="mr-2 sidebar-icon-xxs" />
                        <span>{APP_ROUTE_META.statusDoRegistro.label}</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                  )}

                  {/* 7.3 Férias Admin */}
                  {canAccessRoute(APP_ROUTE_META.ferias) && (
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
                        onClick={() => goTo(APP_PATHS.ferias)}
                      >
                        <TreePalm className="mr-2 sidebar-icon-xxs" />
                        <span>{APP_ROUTE_META.ferias.label}</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                  )}

                  {/* 7.4 Registro Manual Admin */}
                  {canAccessRoute(APP_ROUTE_META.aprovacoesAbono) && (
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
                        onClick={() => goTo(APP_PATHS.aprovacoesAbono)}
                      >
                        <Activity className="mr-2 sidebar-icon-xxs" />
                        <span>{APP_ROUTE_META.aprovacoesAbono.label}</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                  )}

                  {/* 🆕 7.5 AUDITORIA (Subgrupo Fiscal) */}
                  {canAccessRoute(APP_ROUTE_META.auditoria) && (
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
                        onClick={() => goTo(APP_PATHS.auditoria)}
                      >
                        <ScaleIcon className="mr-2 sidebar-icon-xxs" />
                        <span>{APP_ROUTE_META.auditoria.label}</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                  )}
        
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
