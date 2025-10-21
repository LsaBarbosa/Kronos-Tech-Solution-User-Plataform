import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; 
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Calendar, Eye, AlertTriangle, Info, Loader2, Trash2, Users, User } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

// ALTERAÇÃO 1: Atualização da Interface Message para incluir o destinatário
interface Message {
  messageId: string;
  title: string;
  messageText: string;
  priority: 'NORMAL' | 'ALERT' | 'CRITICAL';
  createdAt: string;
  senderEmployeeId: string;
  recipientEmployeeId?: string; // Se null, é visível apenas para o remetente (Manager)
}

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(payload);
  } catch (error) {
    console.error("Falha ao decodificar o token", error);
    return null;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

const Avisos = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Incluindo 'CTO' por ser um papel de administrador/gestor também.
  const [userRole, setUserRole] = useState<'MANAGER' | 'PARTNER' | 'CTO' | ''>(''); 
  const navigate = useNavigate();
  const { toast } = useToast();

  // NOVO: Verifica se a mensagem é visível apenas para o remetente
  const isSenderOnly = (message: Message) => !message.recipientEmployeeId;
  
  // NOVO: Retorna o indicador visual de destinatário (ajustado para a nova lógica)
  const getRecipientIndicator = (message: Message) => {
    if (isSenderOnly(message)) {
      // Se for nulo, significa que a mensagem não tem destinatário, logo, só o remetente a vê.
      return (
        <div className="flex items-center gap-2 text-sm text-yellow-700 font-medium bg-yellow-100/50 px-2 py-1 rounded-full border border-yellow-200">
          <User className="h-4 w-4" />
          <span>Visível Apenas para o Remetente</span>
        </div>
      );
    }
    // Mensagem direcionada a um ou mais colaboradores específicos (o usuário logado é um deles)
    return (
      <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium bg-muted/50 px-2 py-1 rounded-full border border-border/50">
        <User className="h-4 w-4" />
        <span>Mensagem Direcionada</span>
      </div>
    );
  };


  useEffect(() => {
         const token = localStorage.getItem("token");
    if (token) {
        const decoded = decodeToken(token);
        setUserRole(decoded?.role === 'MANAGER' || decoded?.role === 'PARTNER' || decoded?.role === 'CTO' ? decoded.role : '');
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const headers = getAuthHeaders();
        // A API agora usa a nova lógica de filtragem (Remetente OU Destinatário Específico)
        const response = await fetch(`${API_BASE_URL}messages`, {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail ||"Falha ao carregar as mensagens.");
        }

        const data: Message[] = await response.json();
        setMessages(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Erro ao buscar mensagens",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [toast]);

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  };
  
  const handleConfirmDelete = () => { 
    if (selectedMessage) {
      setIsConfirmDeleteDialogOpen(true);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      setIsDeleting(true); 
      const messageId = selectedMessage.messageId;
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}messages/${messageId}`, {
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || "Falha ao deletar a mensagem.");
      }

      setMessages(messages.filter(msg => msg.messageId !== messageId));
      setIsDialogOpen(false);
      setIsConfirmDeleteDialogOpen(false);
      toast({
        title: "Sucesso!",
        description: "Mensagem deletada com sucesso.",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao deletar mensagem",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getIconePorTipo = (priority: string) => {
    switch (priority) {
      case 'NORMAL':
        return <Info className="h-4 w-4 text-muted-foreground" />;
      case 'ALERT':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-destructive" />; 
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getBadgePorTipo = (priority: string) => {
    switch (priority) {
      case 'NORMAL':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground border-muted-foreground/20">Normal</Badge>;
      case 'ALERT':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-200">Alerta</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Crítico</Badge>;
      default:
        return <Badge variant="secondary">Aviso</Badge>;
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getTituloPorTipo = (priority: string) => {
    switch (priority) {
      case 'NORMAL':
        return "Aviso Informativo";
      case 'ALERT':
        return "Aviso de Alerta";
      case 'CRITICAL':
        return "Aviso Crítico";
      default:
        return "Aviso";
    }
  };

 const handleToggleSidebar = () => setSidebarOpen((prev) => !prev); 
  return (
    <div className="flex h-screen bg-background">
      {/* 💡 CORREÇÃO: Sidebar usa 'toggleSidebar' */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} /> 
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />


      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Avisos</h1>
              <p className="text-muted-foreground">Visualize todas as comunicações importantes</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-primary">Carregando avisos...</span>
          </div>
        )}

        {error && (
          <Card className="text-center py-12 border-destructive bg-destructive/10">
            <CardContent>
              <h3 className="text-xl font-semibold text-destructive mb-2">
                Erro ao carregar mensagens
              </h3>
              <p className="text-destructive/80">
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="grid gap-4">
            {messages.map((message) => (
              <Card
                key={message.messageId}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${message.priority === 'NORMAL' ? 'border-l-muted-foreground' :
                    message.priority === 'ALERT' ? 'border-l-yellow-600' :
                      'border-l-destructive'
                  }`}
                onClick={() => handleOpenMessage(message)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIconePorTipo(message.priority)}
                      <div className="flex-1">
                        <CardTitle className={`text-lg font-semibold`}>
                          {message.title} 
                        </CardTitle>
                        <p className="text-sm text-muted-foreground/80 mt-1">
                            {getTituloPorTipo(message.priority)}
                        </p>
                      </div>
                    </div>
                    {getBadgePorTipo(message.priority)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2 pb-4">
                  <div className="flex items-center justify-between">
                    
                    {/* INDICADOR DE DESTINATÁRIO NA LISTA */}
                    {getRecipientIndicator(message)}

                    <div className="flex items-center gap-4 ml-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatarData(message.createdAt)}
                      </div>
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                Nenhum aviso disponível
              </h3>
              <p className="text-muted-foreground">
                Quando houver novos avisos, eles aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* DIALOG PRINCIPAL - Detalhes do Aviso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-xl sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-foreground">
              {selectedMessage && getIconePorTipo(selectedMessage.priority)}
              {selectedMessage && selectedMessage.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground/80 -mt-1 ml-9">
              {selectedMessage && getTituloPorTipo(selectedMessage.priority)}
            </p>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              {/* INDICADOR DE DESTINATÁRIO NO MODAL */}
               <div className="pb-3 border-b border-border/50">
                    {getRecipientIndicator(selectedMessage)}
               </div>

              <div className="flex items-center justify-between border-b pb-3 border-border/50">
                {getBadgePorTipo(selectedMessage.priority)}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatarData(selectedMessage.createdAt)}
                </div>
              </div>
  
              <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                  {selectedMessage.messageText}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {/* Permite deletar se for MANAGER ou CTO */}
            {selectedMessage && (userRole === 'MANAGER' || userRole === 'CTO') && ( 
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Deletar Mensagem
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* DIALOG - Confirmação de Exclusão */}
      <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-destructive">
              <AlertTriangle className="h-6 w-6" /> Confirmação de Exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Você tem certeza que deseja excluir este aviso? Esta ação é irreversível.
            </p>
            {selectedMessage && (
              <p className="mt-2 text-sm font-medium text-foreground">
                Aviso: <span className="italic line-clamp-1 font-bold">{selectedMessage.title}</span>
              </p>
            )}
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMessage}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
              
    </div>
    </div>
  );
};

export default Avisos;