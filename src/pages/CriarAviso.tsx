import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus, Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { API_BASE_URL } from "@/config/api";

// Função auxiliar para obter o token de autenticação
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

const CriarAviso = () => {
  const [tipo, setTipo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePostar = async () => {
    if (!tipo || !mensagem.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    try {
      const headers = getAuthHeaders();
      const payload = {
        messageText: mensagem,
        priority: tipo.toUpperCase(), // Converte para o formato do ENUM do backend
      };

      const response = await fetch(`${API_BASE_URL}messages`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao postar o aviso.");
      }

      toast({
        title: "Aviso criado",
        description: "O aviso foi postado com sucesso!",
      });

      // Limpar formulário e redirecionar
      setTipo("");
      setMensagem("");
      navigate("/avisos");

    } catch (error: any) {
      console.error("Erro ao postar aviso:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao postar o aviso.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "normal":
        return "text-muted-foreground";
      case "alert":
        return "text-yellow-600";
      case "critical":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "normal":
        return "Normal";
      case "alert":
        return "Alerta";
      case "critical":
        return "Crítico";
      default:
        return "Selecione o tipo";
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
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquarePlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Criar Aviso</h1>
              <p className="text-muted-foreground">Crie um novo aviso para os colaboradores</p>
            </div>
          </div>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
            <CardTitle className="text-xl text-foreground">Novo Aviso</CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha as informações do aviso que será enviado aos colaboradores
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-medium text-foreground">
                Tipo do Aviso
              </Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="Selecione o tipo do aviso" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="normal" className="hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                      <span>Normal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alert" className="hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                      <span>Alerta</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="critical" className="hover:bg-accent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                      <span>Crítico</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {tipo && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Tipo selecionado:</span>
                  <span className={`text-sm font-medium ${getTipoColor(tipo)}`}>
                    {getTipoLabel(tipo)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem" className="text-sm font-medium text-foreground">
                Mensagem do Aviso
              </Label>
              <Textarea
                id="mensagem"
                placeholder="Digite aqui a mensagem do aviso..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className="min-h-[200px] bg-background border-input resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {mensagem.length} caracteres
                </span>
                {mensagem.length > 500 && (
                  <span className="text-xs text-orange-500">
                    Mensagem muito longa (recomendado até 500 caracteres)
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handlePostar}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                disabled={!tipo || !mensagem.trim() || isPosting}
              >
                {isPosting ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                    Postando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Postar Aviso
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CriarAviso;