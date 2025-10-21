// src/components/Sidebar.tsx

import { X, Home, BarChart3, FileText, ChevronDown, ChevronRight, User, Shield, Users, Clock, FilePlus, Upload, Download, LogOut, UserCheck, UserPlus, Folder, FolderOpen, FileCheck, Calculator, ClipboardCheck, Building2, Bell, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 💡 CORREÇÃO: Interface ajustada para usar 'toggleSidebar' (Substituindo 'onClose')
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

// 💡 Propriedade desestruturada ajustada para 'toggleSidebar'
const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const [relatoriosOpen, setRelatoriosOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [documentosOpen, setDocumentosOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      setUserRole(decoded?.role || null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
    // 💡 Chamada da função de toggle/fechar
    toggleSidebar(); 
  };

  const menuItems = [
    { name: "Início", path: "/dashboard", icon: Home, roles: ["ADMIN", "MANAGER", "USER"] },
    { name: "Meu Perfil", path: "/usuario", icon: User, roles: ["ADMIN", "MANAGER", "USER"] },
  ];

  const adminMenu = [
    { name: "Lista de Colaboradores", path: "/lista-colaboradores", icon: Users },
    { name: "Criar Colaborador", path: "/criar-colaborador", icon: UserPlus },
    { name: "Criar Gestor", path: "/criar-manager", icon: Shield },
    { name: "Criar Empresa", path: "/criar-empresa", icon: Building2 },
    { name: "Buscar Empresa", path: "/buscar-empresa", icon: Building2 },
    { name: "Atualizar Empresa", path: "/atualizar-empresa", icon: Building2 },
  ];
  
  const managerMenu = [
    { name: "Lista de Colaboradores", path: "/lista-colaboradores", icon: Users },
    { name: "Criar Colaborador", path: "/criar-colaborador", icon: UserPlus },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        // 💡 Chamada da função de toggle/fechar
        onClick={toggleSidebar}
      />

      {/* Sidebar principal */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:sticky md:top-0 md:translate-x-0 md:flex-shrink-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-background">
            <h1 className="text-xl font-bold text-primary">Kronos</h1>
            <Button
              variant="ghost"
              size="icon"
              // 💡 Chamada da função de toggle/fechar
              onClick={toggleSidebar}
              className="md:hidden text-muted-foreground hover:text-primary"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navegação */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {menuItems.map((item) => (
              (userRole && item.roles.includes(userRole)) && (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate(item.path);
                    // 💡 Chamada da função de toggle/fechar
                    toggleSidebar(); 
                  }}
                >
                  <item.icon className="mr-3 sidebar-icon-sm text-primary transition-colors" />
                  <span className="font-medium sidebar-text-sm">{item.name}</span>
                </Button>
              )
            ))}

            {/* Collapsible Relatórios */}
            <Collapsible
              open={relatoriosOpen}
              onOpenChange={setRelatoriosOpen}
              className="w-full space-y-2"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                >
                  <span className="flex items-center">
                    <BarChart3 className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                    <span className="font-medium sidebar-text-sm">Relatórios</span>
                  </span>
                  {relatoriosOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/relatorio-detalhado");
                    // 💡 Chamada da função de toggle/fechar
                    toggleSidebar(); 
                  }}
                >
                  <FileText className="mr-2 sidebar-icon-xs" />
                  <span>Detalhado</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/relatorio-simples");
                    // 💡 Chamada da função de toggle/fechar
                    toggleSidebar(); 
                  }}
                >
                  <FileText className="mr-2 sidebar-icon-xs" />
                  <span>Simples</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/relatorio-horas");
                    // 💡 Chamada da função de toggle/fechar
                    toggleSidebar(); 
                  }}
                >
                  <Clock className="mr-2 sidebar-icon-xs" />
                  <span>Horas</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/apuracao-horas");
                    // 💡 Chamada da função de toggle/fechar
                    toggleSidebar(); 
                  }}
                >
                  <Calculator className="mr-2 sidebar-icon-xs" />
                  <span>Apuração de Horas</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Collapsible Documentos */}
            <Collapsible
              open={documentosOpen}
              onOpenChange={setDocumentosOpen}
              className="w-full space-y-2"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                >
                  <span className="flex items-center">
                    <Folder className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                    <span className="font-medium sidebar-text-sm">Documentos</span>
                  </span>
                  {documentosOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/documentos");
                    // 💡 Chamada da função de toggle/fechar
                    toggleSidebar(); 
                  }}
                >
                  <FileCheck className="mr-2 sidebar-icon-xs" />
                  <span>Meus Documentos</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/enviar-documentos");
                    // 💡 Chamada da função de toggle/fechar
                    toggleSidebar(); 
                  }}
                >
                  <Upload className="mr-2 sidebar-icon-xs" />
                  <span>Enviar Documento</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                  onClick={() => {
                    navigate("/atestado-medico");
                    // 💡 Chamada da função de toggle/fechar
                    toggleSidebar(); 
                  }}
                >
                  <ClipboardCheck className="mr-2 sidebar-icon-xs" />
                  <span>Atestado Médico</span>
                </Button>
                
                {/* Ações de Admin/Manager */}
                {(userRole === "ADMIN" || userRole === "MANAGER") && (
                  <>
                    <Collapsible
                      open={managerOpen}
                      onOpenChange={setManagerOpen}
                      className="w-full space-y-1"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors group"
                        >
                          <span className="flex items-center">
                            <FolderOpen className="mr-2 sidebar-icon-xs" />
                            <span>Documentos Colaboradores</span>
                          </span>
                          {managerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start sidebar-fixed-height-sm px-4 pl-16 text-left sidebar-text-xs hover:bg-primary/10 hover:text-foreground transition-colors"
                          onClick={() => {
                            navigate("/documento-colaborador");
                            // 💡 Chamada da função de toggle/fechar
                            toggleSidebar(); 
                          }}
                        >
                          <FileText className="mr-2 sidebar-icon-xxs" />
                          <span>Buscar Documento</span>
                        </Button>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>
            
            {/* Outras Ações */}
            <Button
              variant="ghost"
              className="w-full justify-start sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors"
              onClick={() => {
                navigate("/avisos");
                // 💡 Chamada da função de toggle/fechar
                toggleSidebar(); 
              }}
            >
              <Bell className="mr-3 sidebar-icon-sm text-primary transition-colors" />
              <span className="font-medium sidebar-text-sm">Avisos</span>
            </Button>
            
            {/* Menus de Administração */}
            {(userRole === "ADMIN") && (
              <Collapsible
                open={managerOpen}
                onOpenChange={setManagerOpen}
                className="w-full space-y-2"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                  >
                    <span className="flex items-center">
                      <Shield className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                      <span className="font-medium sidebar-text-sm">Administração</span>
                    </span>
                    {managerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {adminMenu.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                      onClick={() => {
                        navigate(item.path);
                        // 💡 Chamada da função de toggle/fechar
                        toggleSidebar(); 
                      }}
                    >
                      <item.icon className="mr-2 sidebar-icon-xs" />
                      <span>{item.name}</span>
                    </Button>
                  ))}
                  
                  {/* Pending Approvals */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                    onClick={() => {
                      navigate("/pending-approvals");
                      // 💡 Chamada da função de toggle/fechar
                      toggleSidebar(); 
                    }}
                  >
                    <UserCheck className="mr-2 sidebar-icon-xs" />
                    <span>Aprovações Pendentes</span>
                  </Button>
                  
                  {/* Criar Aviso */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                    onClick={() => {
                      navigate("/criar-aviso");
                      // 💡 Chamada da função de toggle/fechar
                      toggleSidebar(); 
                    }}
                  >
                    <MessageSquarePlus className="mr-2 sidebar-icon-xs" />
                    <span>Criar Aviso</span>
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Menus de Gestor */}
            {(userRole === "MANAGER") && (
              <Collapsible
                open={managerOpen}
                onOpenChange={setManagerOpen}
                className="w-full space-y-2"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between sidebar-fixed-height px-4 text-left hover:bg-primary/10 hover:text-foreground transition-colors group"
                  >
                    <span className="flex items-center">
                      <Shield className="mr-3 sidebar-icon-sm text-primary group-hover:text-primary transition-colors" />
                      <span className="font-medium sidebar-text-sm">Gestão</span>
                    </span>
                    {managerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {managerMenu.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                      onClick={() => {
                        navigate(item.path);
                        // 💡 Chamada da função de toggle/fechar
                        toggleSidebar(); 
                      }}
                    >
                      <item.icon className="mr-2 sidebar-icon-xs" />
                      <span>{item.name}</span>
                    </Button>
                  ))}

                  {/* Pending Approvals */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                    onClick={() => {
                      navigate("/pending-approvals");
                      // 💡 Chamada da função de toggle/fechar
                      toggleSidebar(); 
                    }}
                  >
                    <UserCheck className="mr-2 sidebar-icon-xs" />
                    <span>Aprovações Pendentes</span>
                  </Button>
                  
                  {/* Criar Aviso */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start sidebar-fixed-height-sm px-4 pl-12 text-left sidebar-text-sm hover:bg-primary/10 hover:text-foreground transition-colors"
                    onClick={() => {
                      navigate("/criar-aviso");
                      // 💡 Chamada da função de toggle/fechar
                      toggleSidebar(); 
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