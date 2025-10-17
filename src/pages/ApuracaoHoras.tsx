import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, User, AlertCircle, Pause } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { API_BASE_URL } from "@/config/api";
import { PendingApproval } from "@/utils/report-utils"; // Importado do report-utils

// Interface para padronizar o objeto de erro da API
interface ApiErrorResponse {
  status: number;
  title: string;
  detail: string;
  timestamp: string;
  message?: string;
}

// Função auxiliar para exibir JSON de forma amigável (CORRIGIDA)
// Analisa se o JSON é o formato do backend (ISO) ou do frontend (HH:mm) para exibir corretamente.
const renderBreakJson = (jsonString: string, type: 'current' | 'new') => {
    if (!jsonString) return <span className="text-xs text-muted-foreground/70 italic">Nenhum dado de pausa.</span>;
    try {
        const jsonObject = JSON.parse(jsonString);
        
        // 🚨 AJUSTE PRINCIPAL AQUI:
        // Para 'current' (pausas originais), queremos exibir TODAS as pausas registradas, ativas ou não.
        // Para 'new' (proposta), filtramos apenas as que não estão marcadas para exclusão (b.delete).
        const relevantBreaks = jsonObject
            .filter((b: any) => type === 'current' ? true : !b.delete); // <<<< MUDANÇA APLICADA

        if (relevantBreaks.length === 0) {
            return <span className="text-xs text-muted-foreground/70 italic">Nenhuma pausa relevante.</span>;
        }

        // Formata os dados de pausa para exibição
        const formattedBreaks = relevantBreaks.map((b: any, index: number) => {
            // Verifica o formato dos dados: Backend Java (startBreak/endBreak em ISO) vs Frontend DTO (startHour/endHour)
            const isJavaFormat = b.startBreak && typeof b.startBreak === 'string'; 
            
            let startDisplay = 'N/A'; // Inicializa para ser seguro
            let endDisplay = '...';

            // Lógica para determinar a hora de início
            if (isJavaFormat) {
                startDisplay = format(new Date(b.startBreak), 'HH:mm');
            } else if (b.startHour) {
                startDisplay = b.startHour;
            }

            // Lógica para determinar a hora de fim
            if (isJavaFormat && b.endBreak) {
                endDisplay = format(new Date(b.endBreak), 'HH:mm');
            } else if (b.endHour) {
                endDisplay = b.endHour;
            }

            const label = `${startDisplay} - ${endDisplay}`;
            
            // Determina a badge para melhor clareza na proposta (type === 'new')
            let badge = null;
            if (type === 'new') {
                 // Pausa marcada para exclusão (embora já filtrada, esta é a lógica da badge)
                 if (b.delete) badge = <Badge variant="destructive" className="h-4">Removida</Badge>;
                 // Novo registro criado no frontend (sem ID)
                 else if (b.breakRecordId === null || b.breakRecordId === undefined) badge = <Badge className="h-4 bg-yellow-500 hover:bg-yellow-500/90">Nova</Badge>;
                 // Registro existente que foi apenas editado (tem ID)
                 else badge = <Badge className="h-4 bg-blue-500 hover:bg-blue-500/90">Editada</Badge>;
            }

            return (
                <div key={index} className={`flex justify-between text-xs p-1 rounded-sm ${b.delete ? 'opacity-50 italic line-through' : ''}`}>
                    <span className="font-medium text-foreground">{label}</span>
                    {badge}
                </div>
            );
        });

        return <div className="flex flex-col space-y-1">{formattedBreaks}</div>;
        
    } catch (e) {
        return <span className="text-destructive text-xs">Erro ao parsear JSON.</span>;
    }
};


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

      <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
            Apuração de Horas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de alteração de registro de ponto dos colaboradores
          </p>
        </div>

        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary shadow-card">

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
          </Card>
          <Card className="border-l-4 border-l-primary shadow-card">

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
          </Card>
          <Card className="border-l-4 border-l-primary shadow-card">

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
          </Card>
        </div>

        {/* Requests List */}
        <Card className="border-l-4 border-l-primary shadow-card">

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
                          <TableHead className="min-w-[200px]">Colaborador e Pausas</TableHead>
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
                            <TableCell className="align-top">
                            
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium">{request.partnerName}</span>
                                </div>
                                {/* INÍCIO: DETALHES DAS PAUSAS (Desktop/Tablet) */}
                                <div className="mt-2 text-xs text-muted-foreground border border-primary/20 rounded-lg p-2 bg-muted/20">
                                    <p className="font-bold mb-1 text-primary flex items-center gap-1">
                                        <Pause className="h-3 w-3" />
                                        Pausas Atuais
                                    </p>
                                    <div className="space-y-1 p-2 bg-card rounded-md border">
                                        {renderBreakJson(request.oldBreakRecordsJson, 'current')}
                                    </div>
                                    <p className="font-bold mt-3 mb-1 text-primary flex items-center gap-1">
                                        <Pause className="h-3 w-3" />
                                        Novas Pausas (Proposta)
                                    </p>
                                    <div className="space-y-1 p-2 bg-primary/5 rounded-md border border-primary/20">
                                        {renderBreakJson(request.newBreakRecordsJson, 'new')}
                                    </div>
                                </div>
                                {/* FIM: DETALHES DAS PAUSAS (Desktop/Tablet) */}
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
                  <div className=" space-y-4 md:hidden">
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

                          {/* INÍCIO: DETALHES DAS PAUSAS (Mobile) */}
                          <div className="space-y-3 pt-2 border-t border-dashed border-primary/20">
                            <span className="text-sm font-semibold text-primary flex items-center gap-2">
                                <Pause className="h-4 w-4" /> Detalhes das Pausas
                            </span>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground">Pausas Atuais:</p>
                                <div className="space-y-1 p-2 bg-card rounded-md border">
                                    {renderBreakJson(request.oldBreakRecordsJson, 'current')}
                                </div>
                                <p className="text-xs font-bold text-muted-foreground mt-2">Novas Pausas (Proposta):</p>
                                <div className="space-y-1 p-2 bg-primary/5 rounded-md border border-primary/20">
                                    {renderBreakJson(request.newBreakRecordsJson, 'new')}
                                </div>
                            </div>
                          </div>
                          {/* FIM: DETALHES DAS PAUSAS (Mobile) */}

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
        </Card>
      </main>
    </div>
  );
};

export default ApuracaoHoras;