import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { API_BASE_URL } from "@/config/api";

// Interface para os dados da solicitação pendente, baseada no novo payload da API
interface PendingApproval {
  timeRecordId: number;
  partnerName: string;
  managerUsername: string;
  newStartWork: string;
  newEndWork: string;
}

const ApuracaoHoras = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Renomeado para 'pendingApprovals' para refletir o conteúdo
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para buscar os dados da API real
  const fetchPendingApprovals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const response = await fetch(`${API_BASE_URL}records/pending-approvals`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar as solicitações pendentes.");
      }

      const data: PendingApproval[] = await response.json();
      setPendingApprovals(data);
      
      toast({
        title: "Sucesso",
        description: `Foram encontradas ${data.length} solicitações de alteração pendentes.`,
        className: "border-success bg-success text-white font-medium shadow-lg"
      });

    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao buscar as solicitações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Chama a função de busca ao montar o componente
  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = async (timeRecordId: number, partnerName: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      // Faz a chamada real à API para aprovar o registro
      const response = await fetch(`/api/records/approve/${timeRecordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ocorreu um erro ao aprovar a solicitação.");
      }

      // Remove da lista após aprovação bem-sucedida
      setPendingApprovals(prev => prev.filter(req => req.timeRecordId !== timeRecordId));
      
      toast({
        title: "Solicitação Aprovada",
        description: `A alteração de registro de ${partnerName} foi aprovada com sucesso.`,
        className: "border-success bg-success text-white font-medium shadow-lg"
      });
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast({
        title: "Erro ao Aprovar",
        description: error.message || "Ocorreu um erro ao aprovar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (timeRecordId: number, partnerName: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      // Faz a chamada real à API para rejeitar o registro
      const response = await fetch(`/api/records/reject/${timeRecordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ocorreu um erro ao rejeitar a solicitação.");
      }

      // Remove da lista após rejeição bem-sucedida
      setPendingApprovals(prev => prev.filter(req => req.timeRecordId !== timeRecordId));
      
      toast({
        title: "Solicitação Rejeitada",
        description: `A alteração de registro de ${partnerName} foi rejeitada.`,
        className: "border-destructive bg-destructive text-white font-medium shadow-lg"
      });
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      toast({
        title: "Erro ao Rejeitar",
        description: error.message || "Ocorreu um erro ao rejeitar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Função utilitária para formatar a data e hora
  const formatDateTime = (isoString: string) => {
    if (!isoString) return "";
    return format(new Date(isoString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 page-title">
            Aprovação de Horas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de alteração de registro de ponto dos colaboradores
          </p>
        </div>

        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Solicitações Pendentes</p>
                  <p className="text-2xl font-bold text-primary">{pendingApprovals.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários com Solicitações</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Array.from(new Set(pendingApprovals.map(r => r.partnerName))).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aguardando Ação</p>
                  <p className="text-2xl font-bold text-destructive">{pendingApprovals.length}</p>
                </div>
                <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Solicitações de Alteração de Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : pendingApprovals.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma Solicitação Pendente
                </h3>
                <p className="text-muted-foreground">
                  Todas as solicitações de alteração de registro foram processadas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Administrador</TableHead>
                      <TableHead>Novo Início</TableHead>
                      <TableHead>Novo Fim</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((request) => (
                      <TableRow key={request.timeRecordId} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{request.partnerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="secondary" className="bg-success/10 text-success">
                             {request.managerUsername}
                           </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(request.newStartWork)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(request.newEndWork)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90 text-white"
                              onClick={() => handleApprove(request.timeRecordId, request.partnerName)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.timeRecordId, request.partnerName)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ApuracaoHoras;
