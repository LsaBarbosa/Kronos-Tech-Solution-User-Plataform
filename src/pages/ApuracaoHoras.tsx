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
  currentStartWork: string;
  currentEndWork: string;
}

// Interface para padronizar o objeto de erro da API
interface ApiErrorResponse {
  status: number;
  title: string;
  detail: string;
  timestamp: string;
  message?: string;
}

const ApuracaoHoras = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função utilitária para formatar a data e hora (usando 'yy' para economizar espaço no mobile)
  const formatDateTime = (isoString: string) => {
    if (!isoString) return "N/A";
    // Ajustado para 'yy' para melhor responsividade
    return format(new Date(isoString), 'dd/MM/yy HH:mm', { locale: ptBR });
  };
  
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
        const errorData: ApiErrorResponse = await response.json();
        const errorMessage = errorData.detail || errorData.message || "Erro ao buscar as solicitações pendentes.";
        throw new Error(errorMessage);
      }

      const data: PendingApproval[] = await response.json();
      setPendingApprovals(data);
      
      toast({
        title: "Sucesso",
        description: `Foram encontradas ${data.length} solicitações de alteração pendentes.`,
        className: "border-success bg-success text-white font-medium shadow-lg"
      });

    } catch (error: any) {
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

      const response = await fetch(`${API_BASE_URL}records/approve/${timeRecordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        const errorMessage = errorData.detail || errorData.message || "Ocorreu um erro ao aprovar a solicitação.";
        throw new Error(errorMessage);
      }

      setPendingApprovals(prev => prev.filter(req => req.timeRecordId !== timeRecordId));
      
      toast({
        title: "Solicitação Aprovada",
        description: `A alteração de registro de ${partnerName} foi aprovada com sucesso.`,
        className: "border-success bg-success text-white font-medium shadow-lg"
      });
    } catch (error: any) {
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

      const response = await fetch(`${API_BASE_URL}records/reject/${timeRecordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        const errorMessage = errorData.detail || errorData.message || "Ocorreu um erro ao rejeitar a solicitação.";
        throw new Error(errorMessage);
      }

      setPendingApprovals(prev => prev.filter(req => req.timeRecordId !== timeRecordId));
      
      toast({
        title: "Solicitação Rejeitada",
        description: `A alteração de registro de ${partnerName} foi rejeitada.`,
        className: "border-destructive bg-destructive text-white font-medium shadow-lg"
      });
    } catch (error: any) {
      console.error("Erro ao rejeitar:", error);
      toast({
        title: "Erro ao Rejeitar",
        description: error.message || "Ocorreu um erro ao rejeitar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
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
              <>
                {/* 1. VISUALIZAÇÃO EM TABELA (Desktop/Tablet) */}
                <div className="overflow-x-auto hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Colaborador</TableHead>
                        <TableHead>Administrador</TableHead>
                        <TableHead className="min-w-[120px]">Início Atual</TableHead>
                        <TableHead className="min-w-[120px]">Fim Atual</TableHead>
                        <TableHead className="min-w-[120px]">Novo Início</TableHead>
                        <TableHead className="min-w-[120px]">Novo Fim</TableHead>
                        <TableHead className="text-center min-w-[140px]">Ações</TableHead>
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
                            {formatDateTime(request.currentStartWork)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(request.currentEndWork)}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {formatDateTime(request.newStartWork)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {formatDateTime(request.newEndWork)}
                            </span>
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

                {/* 2. VISUALIZAÇÃO EM CARTÕES (Mobile) */}
                <div className=" space-y-4">
                    {pendingApprovals.map((request) => (
                        <Card key={request.timeRecordId} className="card-hover border-l-4 border-l-primary/50">
                            <CardContent className="p-4 mobile-stack space-y-3">
                                {/* Colaborador & Administrador */}
                                <div className="flex justify-between items-center pb-2 border-b border-border">
                                  <div className="flex items-center gap-2">
                                      <User className="h-5 w-5 text-primary" />
                                      <span className="font-bold text-foreground">{request.partnerName}</span>
                                  </div>
                                  <Badge variant="secondary" className="bg-success/10 text-success">
                                      Administrador : {request.managerUsername}
                                  </Badge>
                                </div>
                                
                                {/* Horários Atuais */}
                                <div className="space-y-1">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                      <Clock className="h-4 w-4" /> Horários Atuais
                                    </span>
                                    <div className="mobile-stack-row p-1 bg-muted/50 rounded-md">
                                        <span className="mobile-stack-label">Início</span>
                                        <span className="mobile-stack-value text-muted-foreground">
                                            {formatDateTime(request.currentStartWork)}
                                        </span>
                                    </div>
                                    <div className="mobile-stack-row p-1 bg-muted/50 rounded-md">
                                        <span className="mobile-stack-label">Fim</span>
                                        <span className="mobile-stack-value text-muted-foreground">
                                            {formatDateTime(request.currentEndWork)}
                                        </span>
                                    </div>
                                </div>

                                {/* Nova Proposta */}
                                <div className="space-y-1 pt-2 border-t border-dashed border-primary/20">
                                    <span className="text-sm font-semibold text-primary flex items-center gap-2">
                                      <AlertCircle className="h-4 w-4" /> Nova Proposta
                                    </span>
                                    <div className="mobile-stack-row p-1 bg-primary/10 rounded-md">
                                        <span className="mobile-stack-label">Novo Início</span>
                                        <span className="mobile-stack-value text-primary font-bold">
                                            {formatDateTime(request.newStartWork)}
                                        </span>
                                    </div>
                                    <div className="mobile-stack-row p-1 bg-primary/10 rounded-md">
                                        <span className="mobile-stack-label">Novo Fim</span>
                                        <span className="mobile-stack-value text-primary font-bold">
                                            {formatDateTime(request.newEndWork)}
                                        </span>
                                    </div>
                                </div>

                                {/* Ações */}
                                <div className="flex justify-between gap-2 pt-4 border-t border-border/50">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-success hover:bg-success/90 text-white"
                                        onClick={() => handleApprove(request.timeRecordId, request.partnerName)}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Aprovar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleReject(request.timeRecordId, request.partnerName)}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Rejeitar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ApuracaoHoras;