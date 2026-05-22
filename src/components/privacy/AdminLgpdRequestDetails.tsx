import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, Clock, User, Building2, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_PATHS } from "@/config/app-routes";
import {
  getAdminRequestDetails,
  completeRequest,
  rejectRequest,
  addNote,
  type LgpdRequestDetailsResponse,
  type LgpdRequestStatus,
} from "@/service/lgpd.service";
const formatDate = (dateString: string | Date): string => {
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateString);
  }
};

export const AdminLgpdRequestDetails = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<LgpdRequestDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNote, setRejectionNote] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!requestId) {
        setError("ID da solicitação não encontrado");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getAdminRequestDetails(requestId);
        setRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar detalhes");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [requestId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar</h2>
          <p className="text-red-700 mb-4">{error || "Solicitação não encontrada"}</p>
          <Button onClick={() => navigate(APP_PATHS.lgpdAdminRequests)}>
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: LgpdRequestStatus) => {
    const colors: Record<LgpdRequestStatus, string> = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_ANALYSIS: "bg-yellow-100 text-yellow-800",
      WAITING_CONTROLLER: "bg-orange-100 text-orange-800",
      WAITING_LEGAL_REVIEW: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PARTIALLY_COMPLETED: "bg-amber-100 text-amber-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: LgpdRequestStatus) => {
    const labels: Record<LgpdRequestStatus, string> = {
      OPEN: "Aberto",
      IN_ANALYSIS: "Em Análise",
      WAITING_CONTROLLER: "Aguardando Controlador",
      WAITING_LEGAL_REVIEW: "Aguardando Revisão Legal",
      COMPLETED: "Concluído",
      REJECTED: "Rejeitado",
      PARTIALLY_COMPLETED: "Parcialmente Concluído",
    };
    return labels[status] || status;
  };

  const handleComplete = async () => {
    if (!requestId || !resolutionNotes.trim()) {
      alert("Nota de resolução é obrigatória");
      return;
    }
    try {
      setActionLoading(true);
      await completeRequest(requestId, resolutionNotes.trim(), "");
      alert("Solicitação concluída com sucesso!");
      if (requestId) {
        const updated = await getAdminRequestDetails(requestId);
        setRequest(updated);
        setResolutionNotes("");
      }
    } catch (err) {
      alert("Erro ao concluir solicitação: " + (err instanceof Error ? err.message : "Erro desconhecido"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!requestId || !rejectionReason.trim() || !rejectionNote.trim()) {
      alert("Motivo e nota de rejeição são obrigatórios");
      return;
    }
    try {
      setActionLoading(true);
      await rejectRequest(requestId, rejectionReason.trim(), rejectionNote.trim(), "");
      alert("Solicitação rejeitada com sucesso!");
      if (requestId) {
        const updated = await getAdminRequestDetails(requestId);
        setRequest(updated);
        setRejectionReason("");
        setRejectionNote("");
      }
    } catch (err) {
      alert("Erro ao rejeitar solicitação: " + (err instanceof Error ? err.message : "Erro desconhecido"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(APP_PATHS.lgpdAdminRequests)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Detalhes da Solicitação</h1>
          <p className="text-muted-foreground text-sm mt-1">ID: {request.request.requestId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                  <p className="text-sm font-medium text-foreground">{request.request.requestType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.request.status)}`}>
                    {getStatusLabel(request.request.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de Criação</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(new Date(request.request.createdAt))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Última Atualização</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(new Date(request.request.updatedAt))}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                <p className="text-sm text-foreground bg-gray-50 p-3 rounded border">
                  {request.request.description}
                </p>
              </div>
              {request.request.resolutionNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notas de Resolução</p>
                  <p className="text-sm text-foreground bg-gray-50 p-3 rounded border">
                    {request.request.resolutionNotes}
                  </p>
                </div>
              )}

              {request.request.status !== "COMPLETED" && request.request.status !== "REJECTED" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Nota de Resolução</label>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Descreva a resolução da solicitação"
                      className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                      rows={3}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleComplete}
                      disabled={actionLoading || !resolutionNotes.trim()}
                      className="flex-1"
                      variant="default"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Concluir
                    </Button>
                  </div>
                </div>
              )}

              {request.request.status !== "COMPLETED" && request.request.status !== "REJECTED" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Motivo da Rejeição</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ex: Solicitação inválida, falta de documentação"
                      className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Nota de Rejeição</label>
                    <textarea
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      placeholder="Motivo detalhado da rejeição"
                      className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                      rows={3}
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <Button
                      onClick={handleReject}
                      disabled={actionLoading || !rejectionReason.trim() || !rejectionNote.trim()}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhum histórico disponível
                </p>
              ) : (
                <div className="space-y-4">
                  {request.history.map((item, index) => (
                    <div
                      key={item.historyId}
                      className="flex gap-4 pb-4"
                      style={{
                        borderLeft: index !== request.history.length - 1 ? "2px solid #e5e7eb" : "none",
                        paddingLeft: "12px",
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-primary mt-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {item.status}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(new Date(item.createdAt))}
                            </p>
                          </div>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-foreground mt-2 bg-gray-50 p-2 rounded">
                            {item.notes}
                          </p>
                        )}
                        {item.changedByUsername && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Por: {item.changedByUsername}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Employee Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Funcionário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Nome</p>
                <p className="text-sm font-medium text-foreground">{request.employee.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Email</p>
                <p className="text-sm text-foreground break-all">{request.employee.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Cargo</p>
                <p className="text-sm text-foreground">{request.employee.jobPosition}</p>
              </div>
            </CardContent>
          </Card>

          {/* Company Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Razão Social</p>
                <p className="text-sm font-medium text-foreground">{request.company.tradeName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">CNPJ</p>
                <p className="text-sm text-foreground">{request.company.cnpj}</p>
              </div>
            </CardContent>
          </Card>

          {/* Assigned To Card */}
          {request.assignedTo ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atribuído a</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Usuário</p>
                  <p className="text-sm font-medium text-foreground">
                    {request.assignedTo.username}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Função</p>
                  <p className="text-sm text-foreground">{request.assignedTo.role}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-6">
                <p className="text-sm text-muted-foreground text-center">
                  Não atribuído a ninguém
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
