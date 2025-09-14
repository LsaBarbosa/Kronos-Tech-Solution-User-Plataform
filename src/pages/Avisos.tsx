import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Calendar, Eye, AlertTriangle, Info, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";

interface Message {
  messageId: string;
  messageText: string;
  priority: 'NORMAL' | 'ALERT' | 'CRITICAL';
  createdAt: string;
  senderEmployeeId: string;
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const headers = getAuthHeaders();
        const response = await fetch("/api/messages", {
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

  const getIconePorTipo = (priority: string) => {
    switch (priority) {
      case 'NORMAL':
        return <Info className="h-4 w-4 text-muted-foreground" />;
      case 'ALERT':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'CRITICAL':
        return <CheckCircle className="h-4 w-4 text-destructive" />;
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Avisos</h1>
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
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${
                  message.priority === 'NORMAL' ? 'border-l-muted-foreground' : 
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
                          {getTituloPorTipo(message.priority)}
                        </CardTitle>
                      </div>
                    </div>
                    {getBadgePorTipo(message.priority)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground line-clamp-2 flex-1">
                      {message.messageText.substring(0, 100)}...
                    </p>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {selectedMessage && getIconePorTipo(selectedMessage.priority)}
              {selectedMessage && getTituloPorTipo(selectedMessage.priority)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {getBadgePorTipo(selectedMessage.priority)}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatarData(selectedMessage.createdAt)}
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.messageText}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Avisos;