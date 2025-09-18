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
            className="hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2 flex flex-col h-full">
          <div className="flex-1 space-y-2">
            {/* Início */}
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
              onClick={() => {
                navigate("/dashboard");
                onClose();
              }}
            >
              <Home className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium">Início</span>
            </Button>

            {/* Relatórios */}
            <Collapsible open={relatoriosOpen} onOpenChange={setRelatoriosOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 px-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
                >
                  <BarChart3 className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
                  <span className="font-medium flex-1">Relatórios</span>
                  {relatoriosOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-4 pl-12 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    navigate("/relatorio-simples");
                    onClose();
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Relatório Simples</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-4 pl-12 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    navigate("/relatorio-detalhado");
                    onClose();
                  }}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Relatório Detalhado</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Documentos */}
            <Collapsible open={documentosOpen} onOpenChange={setDocumentosOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 px-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
                >
                  <Folder className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
                  <span className="font-medium flex-1">Documentos</span>
                  {documentosOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-4 pl-12 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    navigate("/documentos");
                    onClose();
                  }}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span>Ver Documentos</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-4 pl-12 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    navigate("/enviar-atestado");
                    onClose();
                  }}
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  <span>Enviar Atestado</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Usuário */}
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
              onClick={() => {
                navigate("/usuario");
                onClose();
              }}
            >
              <User className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium">Usuário</span>
            </Button>

            {/* Empresa (Visível apenas para CTO) */}
            {isCto && (
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
                onClick={() => {
                  navigate("/empresa");
                  onClose();
                }}
              >
                <Building2 className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
                <span className="font-medium">Empresa</span>
              </Button>
            )}

            {/* Avisos */}
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
              onClick={() => {
                navigate("/avisos");
                onClose();
              }}
            >
              <Bell className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium">Avisos</span>
            </Button>
            
            {/* Administrador (Somente visível para MANAGER) */}
            {isManager && (
              <Collapsible open={administradorOpen} onOpenChange={setAdministradorOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 px-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
                  >
                    <Shield className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
                    <span className="font-medium flex-1">Administrador</span>
                    {administradorOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {/* Colaboradores */}
                  <Collapsible open={colaboradoresOpen} onOpenChange={setColaboradoresOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-10 px-4 pl-12 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors group"
                      >
                        <Users className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        <span className="flex-1">Colaboradores</span>
                        {colaboradoresOpen ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 px-4 pl-20 text-left text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          navigate("/lista-colaboradores");
                          onClose();
                        }}
                      >
                        <UserCheck className="mr-2 h-3 w-3" />
                        <span>Lista de Colaboradores</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 px-4 pl-20 text-left text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          navigate("/criar-colaborador");
                          onClose();
                        }}
                      >
                        <UserPlus className="mr-2 h-3 w-3" />
                        <span>Criar Colaborador</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Folha de Ponto */}
                  <Collapsible open={folhaDePontoOpen} onOpenChange={setFolhaDePontoOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-10 px-4 pl-12 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors group"
                      >
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        <span className="flex-1">Folha de Ponto</span>
                        {folhaDePontoOpen ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 px-4 pl-20 text-left text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          navigate("/apuracao-horas");
                          onClose();
                        }}
                      >
                        <Calculator className="mr-2 h-3 w-3" />
                        <span>Apuração de Horas</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 px-4 pl-20 text-left text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          navigate("/status-do-registro");
                          onClose();
                        }}
                      >
                        <ClipboardCheck className="mr-2 h-3 w-3" />
                        <span>Status do Registro</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Documentos */}
                  <Collapsible open={adminDocumentosOpen} onOpenChange={setAdminDocumentosOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-10 px-4 pl-12 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors group"
                      >
                        <Folder className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        <span className="flex-1">Documentos</span>
                        {adminDocumentosOpen ? (
                          <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 px-4 pl-20 text-left text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          navigate("/documentos");
                          onClose();
                        }}
                      >
                        <FolderOpen className="mr-2 h-3 w-3" />
                        <span>Ver Documentos</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-9 px-4 pl-20 text-left text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => {
                          navigate("/enviar-atestado");
                          onClose();
                        }}
                      >
                        <FilePlus className="mr-2 h-3 w-3" />
                        <span>Enviar Atestado</span>
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Criar Aviso */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 px-4 pl-12 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => {
                      navigate("/criar-aviso");
                      onClose();
                    }}
                  >
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    <span>Criar Aviso</span>
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Sair */}
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-left hover:bg-accent hover:text-accent-foreground transition-colors group"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5 text-primary group-hover:text-primary transition-colors" />
              <span className="font-medium">Sair</span>
            </Button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;