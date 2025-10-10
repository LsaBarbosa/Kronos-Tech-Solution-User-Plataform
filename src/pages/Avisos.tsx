import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Importei o DialogFooter aqui para usá-lo no novo Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; 
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Calendar, Eye, AlertTriangle, Info, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

// ALTERAÇÃO 1: Atualização da Interface Message
interface Message {
  messageId: string;
  title: string; // NOVO CAMPO: Adicionado o título
  messageText: string;
  priority: 'NORMAL' | 'ALERT' | 'CRITICAL';
  createdAt: string;
  senderEmployeeId: string;
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
  // NOVO ESTADO: Para controlar o diálogo de confirmação de exclusão
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); // NOVO ESTADO: Para feedback visual durante a exclusão
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'MANAGER' | 'PARTNER' | ''>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
         const token = localStorage.getItem("token");
    if (token) {
        const decoded = decodeToken(token);
        setUserRole(decoded?.role === 'MANAGER' || decoded?.role === 'PARTNER' ? decoded.role : '');
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}messages`, {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar as mensagens.");
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
  
  // NOVA FUNÇÃO: Abre o diálogo de confirmação
  const handleConfirmDelete = () => { 
    if (selectedMessage) {
      setIsConfirmDeleteDialogOpen(true);
    }
  };

  // FUNÇÃO DE EXCLUSÃO MODIFICADA
  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      setIsDeleting(true); // Inicia o loading
      const messageId = selectedMessage.messageId;
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}messages/${messageId}`, {
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar a mensagem.");
      }

      setMessages(messages.filter(msg => msg.messageId !== messageId));
      setIsDialogOpen(false); // Fecha o diálogo principal
      setIsConfirmDeleteDialogOpen(false); // Fecha o diálogo de confirmação
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
      setIsDeleting(false); // Finaliza o loading
    }
  };

  const getIconePorTipo = (priority: string) => {
    switch (priority) {
      case 'NORMAL':
        return <Info className="h-4 w-4 text-muted-foreground" />;
      case 'ALERT':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'CRITICAL':
      // Modifiquei para um ícone que talvez faça mais sentido para "Crítico" se CheckCircle era usado para outra coisa
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
        return "Aviso Normal";
      case 'ALERT':
        return "Aviso de Alerta";
      case 'CRITICAL':
        return "Aviso Crítico";
      default:
        return "Aviso";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                        {/* Exibir o título do aviso */}
                        <CardTitle className={`text-lg font-semibold`}>
                          {message.title} 
                        </CardTitle>
                        {/* Adicionar o tipo/prioridade como um subtítulo */}
                        <p className="text-sm text-muted-foreground/80 mt-1">
                            {getTituloPorTipo(message.priority)}
                        </p>
                      </div>
                    </div>
                    {getBadgePorTipo(message.priority)}
                  </div>
                </CardHeader>
                {/* ALTERAÇÃO CHAVE: Modificando CardContent para remover a prévia */}
                <CardContent className="pt-2 pb-4">
                  <div className="flex items-center justify-end">
                    
                    {/* Movemos a data e o botão para cá, removendo a prévia da mensagem */}
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
                {/* FIM DA ALTERAÇÃO CHAVE */}
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
      
      {/* DIALOG PRINCIPAL - Detalhes do Aviso (Mantido inalterado) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-xl sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
          <DialogHeader>
            {/* Exibir o Título real do aviso na Dialog */}
            <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-foreground">
              {selectedMessage && getIconePorTipo(selectedMessage.priority)}
              {selectedMessage && selectedMessage.title}
            </DialogTitle>
            {/* Adicionar o Tipo/Prioridade como subtítulo da Dialog */}
            <p className="text-sm text-muted-foreground/80 -mt-1 ml-9">
              {selectedMessage && getTituloPorTipo(selectedMessage.priority)}
            </p>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-border/50">
                {getBadgePorTipo(selectedMessage.priority)}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatarData(selectedMessage.createdAt)}
                </div>
              </div>
  
              {/* Área de conteúdo da mensagem com melhor espaçamento e legibilidade */}
              <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                  {selectedMessage.messageText}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {/* O botão 'Deletar Mensagem' agora chama a função de confirmação */}
            {selectedMessage && userRole === 'MANAGER' && ( 
              <Button
                variant="destructive"
                onClick={handleConfirmDelete} // Chama o novo handler
              >
                <Trash2 className="mr-2 h-4 w-4" /> Deletar Mensagem
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* NOVO DIALOG - Confirmação de Exclusão (Mantido inalterado) */}
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
                {/* Exibir o Título na confirmação de exclusão */}
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
  );
};

export default Avisos;