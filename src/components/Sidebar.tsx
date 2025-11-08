// src/components/Sidebar.tsx

import { X, Home, BarChart3, ChevronDown, ChevronRight, User, Shield, Users, Clock, FilePlus, Upload, LogOut, UserCheck, UserPlus, Folder, FolderOpen, Calculator, ClipboardCheck, Building2, Bell, MessageSquarePlus, TreePalm, AlarmClockPlus, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 💡 Alteração: A interface foi atualizada para usar 'toggleSidebar' para refletir a nova funcionalidade.
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void; 
}

// Função para decodificar o token JWT (mantida)
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(payload);
  } catch (error) {
    console.error("Falha ao decodificar o token", error);
    return null;
  }
};

// 💡 Alteração: Recebendo a nova prop toggleSidebar
const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  // Estados de Collapsible mantidos da versão de produção
  const [relatoriosOpen, setRelatoriosOpen] = useState(false);
  const [documentosOpen, setDocumentosOpen] = useState(false);
  const [administradorOpen, setAdministradorOpen] = useState(false);
  const [colaboradoresOpen, setColaboradoresOpen] = useState(false);
  const [folhaDePontoOpen, setFolhaDePontoOpen] = useState(false);
  const [adminVacationOpen, setAdminVacationOpen] = useState(false);
   const [adminTimeOffOpen, setAdminTimeOffOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUserRole(decoded?.role || "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    toggleSidebar(); // 💡 Alteração: Usando toggleSidebar
  };

  const isManager = userRole === "MANAGER";
  const isCto = userRole === "CTO";

  return (
    <>
      {/* 1. Overlay (Fundo escuro quando aberto) */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          // Garante a visibilidade quando aberto e esconde quando fechado
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        onClick={toggleSidebar} // 💡 Alteração: Fecha o menu ao clicar no overlay
      />

      {/* 2. Sidebar Principal (Deslizante) */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-80 bg-background border-r border-border shadow-xl transform transition-transform duration-200 ease-in-out",
          // Aplica o deslize (slide-in/slide-out)
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar} // 💡 Alteração: Fecha o menu no botão 'X'
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items (Conteúdo com scroll) */}
        <div className="p-4 flex-1 space-y-2 flex flex-col h-full overflow-y-auto">
          <div className="space-y-2">
            
            {/* 1. Início */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => {
                navigate("/dashboard");
                toggleSidebar();
              }}
            >
              <Home className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Início</span>
            </Button>

            {/* 2. Relatórios (Collapsible) */}
            <Collapsible open={relatoriosOpen} onOpenChange={setRelatoriosOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                >
                  <BarChart3 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                  <span className="font-medium flex-1 sidebar-text-sm">Relatórios</span>
                  {relatoriosOpen ? (
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
                  onClick={() => {
                    navigate("/relatorio-detalhado");
                    toggleSidebar();
                  }}
                >
                  <BarChart3 className="mr-2 sidebar-icon-xs" />
                  <span>Relatório de Horas</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* 3. Documentos (Collapsible) */}
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
                  onClick={() => {
                    navigate("/documentos");
                    toggleSidebar();
                  }}
                >
                  <FolderOpen className="mr-2 sidebar-icon-xs" />
                  <span>Buscar Documentos</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/enviar-documento-colaborador");
                    toggleSidebar();
                  }}
                >
                  <FilePlus className="mr-2 sidebar-icon-xs" />
                  <span>Enviar Documentos</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* 4. Usuário */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => {
                navigate("/usuario");
                toggleSidebar();
              }}
            >
              <User className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Usuário</span>
            </Button>

            {/* 5. Empresa (Visível apenas para CTO) */}
            {isCto && (
              <Button
                variant="ghost"
                className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                onClick={() => {
                  navigate("/empresa");
                  toggleSidebar();
                }}
              >
                <Building2 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                <span className="font-medium sidebar-text-sm">Empresa</span>
              </Button>
            )}

            {/* 6. Avisos */}
           
  <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => {
                          navigate("/solicitar-ferias");
                          toggleSidebar();
                        }}
            >
              <TreePalm className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Férias</span>
            </Button>
             
               <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => {
                          navigate("/solicitar-Abono");
                          toggleSidebar();
                        }}
            >
              <TimerReset className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Abono de Horas</span>
            </Button>
            
            {/* 7. Administrador (Somente visível para MANAGER) */}
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
                  
                  {/* 7.1 Colaboradores (Nested Collapsible) */}
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
                        onClick={() => {
                          navigate("/lista-colaboradores");
                          toggleSidebar();
                        }}
                      >
                        <UserCheck className="mr-2 sidebar-icon-xxs" />
                        <span>Lista de Colaboradores</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => {
                          navigate("/criar-colaborador");
                          toggleSidebar();
                        }}
                      >
                        <UserPlus className="mr-2 sidebar-icon-xxs" />
                        <span>Criar Colaborador</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 7.2 Folha de Ponto (Nested Collapsible) */}
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
                        onClick={() => {
                          navigate("/apuracao-horas");
                          toggleSidebar();
                        }}
                      >
                        <Calculator className="mr-2 sidebar-icon-xxs" />
                        <span>Apuração de Horas</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => {
                          navigate("/status-do-registro");
                          toggleSidebar();
                        }}
                      >
                        <ClipboardCheck className="mr-2 sidebar-icon-xxs" />
                        <span>Status do Registro</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 7.3 Documentos (Nested Collapsible - Administrador) */}
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
                        onClick={() => {
                          navigate("/ferias");
                          toggleSidebar();
                        }}
                      >
                        <TreePalm className="mr-2 sidebar-icon-xxs" />
                        <span>Gestão de Férias</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

 {/* 7.3 Documentos (Nested Collapsible - Administrador) */}
                  <Collapsible open={adminTimeOffOpen} onOpenChange={setAdminTimeOffOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        <TreePalm className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Abono de Horas</span>
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
                        onClick={() => {
                          navigate("/aprovacoes-abono");
                          toggleSidebar();
                        }}
                      >
                        <TreePalm className="mr-2 sidebar-icon-xxs" />
                        <span>Gestão de abono de horas</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
        
                </CollapsibleContent>
              </Collapsible>
            )}
            
            
            {/* 8. Sair */}
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