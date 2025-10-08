import { X, Home, BarChart3, FileText, ChevronDown, ChevronRight, User, Shield, Users, Clock, FilePlus, Upload, Download, LogOut, UserCheck, UserPlus, Folder, FolderOpen, FileCheck, Calculator, ClipboardCheck, Building2, Bell, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Função para decodificar o token JWT
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

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [relatoriosOpen, setRelatoriosOpen] = useState(false);
  const [documentosOpen, setDocumentosOpen] = useState(false);
  const [administradorOpen, setAdministradorOpen] = useState(false);
  const [colaboradoresOpen, setColaboradoresOpen] = useState(false);
  const [folhaDePontoOpen, setFolhaDePontoOpen] = useState(false);
  const [adminDocumentosOpen, setAdminDocumentosOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUserRole(decoded?.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    onClose();
  };

  const isManager = userRole === "MANAGER";
  const isCto = userRole === "CTO";

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-80 bg-background border-r border-border shadow-xl transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            // CORREÇÃO APLICADA: Usando cor primária para hover e garantindo contraste
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="p-4 flex-1 space-y-2 flex flex-col h-full overflow-y-auto">
          <div className="space-y-2">
            {/* Início */}
            <Button
              variant="ghost"
              // CORREÇÃO APLICADA: Hover sutil e texto foreground
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => {
                navigate("/dashboard");
                onClose();
              }}
            >
              <Home className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Início</span>
            </Button>

            {/* Relatórios */}
            <Collapsible open={relatoriosOpen} onOpenChange={setRelatoriosOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  // CORREÇÃO APLICADA: Hover sutil e texto foreground
                  className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                >
                  <BarChart3 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                  <span className="font-medium flex-1 sidebar-text-sm">Relatórios</span>
                  {relatoriosOpen ? (
                    // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                    <ChevronDown className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                    <ChevronRight className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button
                  variant="ghost"
                  // CORREÇÃO APLICADA: Hover sutil e texto foreground
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/relatorio-simples");
                    onClose();
                  }}
                >
                  <FileText className="mr-2 sidebar-icon-xs" />
                  <span>Relatório Simples</span>
                </Button>
                <Button
                  variant="ghost"
                  // CORREÇÃO APLICADA: Hover sutil e texto foreground
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/relatorio-detalhado");
                    onClose();
                  }}
                >
                  <BarChart3 className="mr-2 sidebar-icon-xs" />
                  <span>Relatório Detalhado</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Documentos */}
            <Collapsible open={documentosOpen} onOpenChange={setDocumentosOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  // CORREÇÃO APLICADA: Hover sutil e texto foreground
                  className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                >
                  <Folder className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                  <span className="font-medium flex-1 sidebar-text-sm">Documentos</span>
                  {documentosOpen ? (
                    // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                    <ChevronDown className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                    <ChevronRight className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button
                  variant="ghost"
                  // CORREÇÃO APLICADA: Hover sutil e texto foreground
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/documentos");
                    onClose();
                  }}
                >
                  <FolderOpen className="mr-2 sidebar-icon-xs" />
                  <span>Buscar Documentos</span>
                </Button>
                <Button
                  variant="ghost"
                  // CORREÇÃO APLICADA: Hover sutil e texto foreground
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/enviar-documento-colaborador");
                    onClose();
                  }}
                >
                  <FilePlus className="mr-2 sidebar-icon-xs" />
                  <span>Enviar Documentos</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Usuário */}
            <Button
              variant="ghost"
              // CORREÇÃO APLICADA: Hover sutil e texto foreground
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => {
                navigate("/usuario");
                onClose();
              }}
            >
              <User className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Usuário</span>
            </Button>

            {/* Empresa (Visível apenas para CTO) */}
            {isCto && (
              <Button
                variant="ghost"
                // CORREÇÃO APLICADA: Hover sutil e texto foreground
                className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                onClick={() => {
                  navigate("/empresa");
                  onClose();
                }}
              >
                <Building2 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                <span className="font-medium sidebar-text-sm">Empresa</span>
              </Button>
            )}

            {/* Avisos */}
            <Button
              variant="ghost"
              // CORREÇÃO APLICADA: Hover sutil e texto foreground
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
              onClick={() => {
                navigate("/avisos");
                onClose();
              }}
            >
              <Bell className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Avisos</span>
            </Button>
            
            {/* Administrador (Somente visível para MANAGER) */}
            {isManager && (
              <Collapsible open={administradorOpen} onOpenChange={setAdministradorOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    // CORREÇÃO APLICADA: Hover sutil e texto foreground
                    className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                  >
                    <Shield className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                    <span className="font-medium flex-1 sidebar-text-sm">Administrador</span>
                    {administradorOpen ? (
                      // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                      <ChevronDown className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                      <ChevronRight className="sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {/* Colaboradores */}
                  <Collapsible open={colaboradoresOpen} onOpenChange={setColaboradoresOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        {/* CORREÇÃO APLICADA: Ícone usando text-foreground no hover */}
                        <Users className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Colaboradores</span>
                        {colaboradoresOpen ? (
                          // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                          <ChevronDown className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                          <ChevronRight className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => {
                          navigate("/lista-colaboradores");
                          onClose();
                        }}
                      >
                        <UserCheck className="mr-2 sidebar-icon-xxs" />
                        <span>Lista de Colaboradores</span>
                      </Button>
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => {
                          navigate("/criar-colaborador");
                          onClose();
                        }}
                      >
                        <UserPlus className="mr-2 sidebar-icon-xxs" />
                        <span>Criar Colaborador</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Folha de Ponto */}
                  <Collapsible open={folhaDePontoOpen} onOpenChange={setFolhaDePontoOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        {/* CORREÇÃO APLICADA: Ícone usando text-foreground no hover */}
                        <Clock className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Folha de Ponto</span>
                        {folhaDePontoOpen ? (
                          // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                          <ChevronDown className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                          <ChevronRight className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => {
                          navigate("/apuracao-horas");
                          onClose();
                        }}
                      >
                        <Calculator className="mr-2 sidebar-icon-xxs" />
                        <span>Apuração de Horas</span>
                      </Button>
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => {
                          navigate("/status-do-registro");
                          onClose();
                        }}
                      >
                        <ClipboardCheck className="mr-2 sidebar-icon-xxs" />
                        <span>Status do Registro</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Documentos */}
                  <Collapsible open={adminDocumentosOpen} onOpenChange={setAdminDocumentosOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                      >
                        {/* CORREÇÃO APLICADA: Ícone usando text-foreground no hover */}
                        <Folder className="mr-2 sidebar-icon-xs text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="flex-1">Documentos</span>
                        {adminDocumentosOpen ? (
                          // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                          <ChevronDown className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        ) : (
                          // CORREÇÃO APLICADA: Seta usando text-foreground no hover
                          <ChevronRight className="sidebar-icon-xxs text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => {
                          navigate("/documentos");
                          onClose();
                        }}
                      >
                        <FolderOpen className="mr-2 sidebar-icon-xxs" />
                        <span>Buscar Documentos</span>
                      </Button>
                      <Button
                        variant="ghost"
                        // CORREÇÃO APLICADA: Hover sutil e texto foreground
                        className="w-full justify-start sidebar-fixed-height-xs px-4 pl-20 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                        onClick={() => {
                          navigate("/enviar-documentos");
                          onClose();
                        }}
                      >
                        <Upload className="mr-2 sidebar-icon-xxs" />
                        <span>Enviar Documentos</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Criar Aviso */}
                  <Button
                    variant="ghost"
                    // CORREÇÃO APLICADA: Hover sutil e texto foreground
                    className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                    onClick={() => {
                      navigate("/criar-aviso");
                      onClose();
                    }}
                  >
                    <MessageSquarePlus className="mr-2 sidebar-icon-xs" />
                    <span>Criar Aviso</span>
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Sair */}
            <Button
              variant="ghost"
              // CORREÇÃO APLICADA: Hover sutil e texto foreground
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