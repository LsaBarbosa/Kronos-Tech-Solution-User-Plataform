import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, Clock, User, Building2, CheckCircle, XCircle, MessageSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_PATHS } from "@/config/app-routes";
import { toast } from "@/hooks/use-toast";
import {
  getAdminRequestDetails,
  completeRequest,
  rejectRequest,
  addNote,
  transitionRequestStatus,
  requestComplementFromDataSubject,
  cancelLgpdRequest,
  getAvailableTransitions,
  exportApprovedLgpdRequestData,
  type LgpdRequestDetailsResponse,
  type LgpdRequestStatus,
  type LgpdRequestTransitionPayload,
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
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<LgpdRequestStatus | null>(null);
  const [transitionNotes, setTransitionNotes] = useState("");
  const [complementMessage, setComplementMessage] = useState("");
  const [showComplementDialog, setShowComplementDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportLegalBasis, setExportLegalBasis] = useState("");
  const [exportOperationalReason, setExportOperationalReason] = useState("");
  const [exportReviewerNotes, setExportReviewerNotes] = useState("");
  const [exportIncludePreciseGeolocation, setExportIncludePreciseGeolocation] = useState(false);

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
      APPROVED_FOR_EXPORT: "bg-green-100 text-green-800",
      WAITING_DATA_SUBJECT: "bg-indigo-100 text-indigo-800",
      COMPLETED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PARTIALLY_COMPLETED: "bg-amber-100 text-amber-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: LgpdRequestStatus) => {
    const labels: Record<LgpdRequestStatus, string> = {
      OPEN: "Aberto",
      IN_ANALYSIS: "Em Análise",
      WAITING_CONTROLLER: "Aguardando Controlador",
      WAITING_LEGAL_REVIEW: "Aguardando Revisão Legal",
      APPROVED_FOR_EXPORT: "Aprovado para Exportação",
      WAITING_DATA_SUBJECT: "Aguardando Sujeito de Dados",
      COMPLETED: "Concluído",
      REJECTED: "Rejeitado",
      PARTIALLY_COMPLETED: "Parcialmente Concluído",
      CANCELLED: "Cancelado",
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

  const handleTransition = async () => {
    if (!requestId || !selectedTransition) {
      alert("Status de transição é obrigatório");
      return;
    }

    const payload: LgpdRequestTransitionPayload = {
      newStatus: selectedTransition,
      publicNotes: transitionNotes.trim() || undefined,
      internalNotes: undefined,
      closedReason:
        selectedTransition === "REJECTED" && rejectionReason.trim()
          ? rejectionReason.trim()
          : undefined,
    };

    try {
      setActionLoading(true);
      await transitionRequestStatus(requestId, payload);
      alert("Solicitação transicionada com sucesso!");
      if (requestId) {
        const updated = await getAdminRequestDetails(requestId);
        setRequest(updated);
        setShowTransitionDialog(false);
        setSelectedTransition(null);
        setTransitionNotes("");
      }
    } catch (err) {
      alert(
        "Erro ao transicionar solicitação: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestComplement = async () => {
    if (!requestId || !complementMessage.trim()) {
      alert("Mensagem é obrigatória");
      return;
    }

    try {
      setActionLoading(true);
      await requestComplementFromDataSubject(requestId, {
        message: complementMessage.trim(),
      });
      alert("Solicitação de complemento enviada com sucesso!");
      if (requestId) {
        const updated = await getAdminRequestDetails(requestId);
        setRequest(updated);
        setShowComplementDialog(false);
        setComplementMessage("");
      }
    } catch (err) {
      alert(
        "Erro ao solicitar complemento: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!requestId || !cancelReason.trim()) {
      alert("Motivo do cancelamento é obrigatório");
      return;
    }

    try {
      setActionLoading(true);
      await cancelLgpdRequest(requestId, { reason: cancelReason.trim() });
      alert("Solicitação cancelada com sucesso!");
      if (requestId) {
        const updated = await getAdminRequestDetails(requestId);
        setRequest(updated);
        setShowCancelDialog(false);
        setCancelReason("");
      }
    } catch (err) {
      alert(
        "Erro ao cancelar solicitação: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportRequest = async () => {
    if (!requestId) {
      toast.error("ID da solicitação não disponível");
      return;
    }

    if (!exportLegalBasis.trim()) {
      toast.error("Fundamento legal é obrigatório");
      return;
    }

    if (!exportOperationalReason.trim()) {
      toast.error("Motivo operacional é obrigatório");
      return;
    }

    if (!exportReviewerNotes.trim()) {
      toast.error("Notas do revisor são obrigatórias");
      return;
    }

    setIsExporting(true);

    try {
      const exportResponse = await exportApprovedLgpdRequestData(requestId, {
        includePreciseGeolocation: exportIncludePreciseGeolocation,
        legalBasis: exportLegalBasis.trim(),
        operationalReason: exportOperationalReason.trim(),
        reviewerNotes: exportReviewerNotes.trim(),
      });

      const json = JSON.stringify(exportResponse, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dados-solicitacao-${requestId}-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso!");
      setShowExportModal(false);
      setExportLegalBasis("");
      setExportOperationalReason("");
      setExportReviewerNotes("");
      setExportIncludePreciseGeolocation(false);

      if (requestId) {
        const updated = await getAdminRequestDetails(requestId);
        setRequest(updated);
      }
    } catch (err) {
      toast.error(
        "Erro ao exportar dados: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    } finally {
      setIsExporting(false);
    }
  };

  const isExportableType = (type: string) => {
    return ["ACCESS", "PORTABILITY", "SHARING_INFORMATION", "CONFIRM_PROCESSING"].includes(type);
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

              {request.request.status === "APPROVED_FOR_EXPORT" &&
                isExportableType(request.request.requestType) && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setShowExportModal(true)}
                    disabled={isExporting}
                    className="gap-2"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Dados Revisados
                  </Button>
                </div>
              )}

              {!["COMPLETED", "REJECTED", "PARTIALLY_COMPLETED", "CANCELLED"].includes(
                request.request.status
              ) && (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm font-medium text-foreground">Ações Disponíveis</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setShowTransitionDialog(true)}
                      disabled={actionLoading}
                      variant="outline"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Transicionar
                    </Button>
                    {request.request.status === "WAITING_DATA_SUBJECT" && (
                      <Button
                        onClick={() => setShowComplementDialog(true)}
                        disabled={actionLoading}
                        variant="outline"
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Solicitar Complemento
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowCancelDialog(true)}
                      disabled={actionLoading}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {showTransitionDialog && (
                <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Novo Status
                    </label>
                    <select
                      value={selectedTransition || ""}
                      onChange={(e) =>
                        setSelectedTransition(e.target.value as LgpdRequestStatus)
                      }
                      className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground"
                      disabled={actionLoading}
                    >
                      <option value="">Selecione um status</option>
                      {getAvailableTransitions(request.request.status).map((status) => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTransition === "REJECTED" && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Motivo da Rejeição
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Ex: Solicitação inválida"
                        className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                        disabled={actionLoading}
                      />
                    </div>
                  )}

                  {["COMPLETED", "PARTIALLY_COMPLETED"].includes(selectedTransition || "") && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Notas de Resolução
                      </label>
                      <textarea
                        value={transitionNotes}
                        onChange={(e) => setTransitionNotes(e.target.value)}
                        placeholder="Descreva a resolução"
                        className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                        rows={3}
                        disabled={actionLoading}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleTransition}
                      disabled={
                        actionLoading ||
                        !selectedTransition ||
                        (selectedTransition === "REJECTED" && !rejectionReason.trim()) ||
                        (["COMPLETED", "PARTIALLY_COMPLETED"].includes(selectedTransition || "") &&
                          !transitionNotes.trim())
                      }
                      className="flex-1"
                      variant="default"
                    >
                      Confirmar Transição
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTransitionDialog(false);
                        setSelectedTransition(null);
                        setTransitionNotes("");
                        setRejectionReason("");
                      }}
                      disabled={actionLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {showComplementDialog && (
                <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Mensagem de Solicitação
                    </label>
                    <textarea
                      value={complementMessage}
                      onChange={(e) => setComplementMessage(e.target.value)}
                      placeholder="Descreva quais informações adicionais são necessárias"
                      className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                      rows={4}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRequestComplement}
                      disabled={actionLoading || !complementMessage.trim()}
                      className="flex-1"
                      variant="default"
                    >
                      Enviar Solicitação
                    </Button>
                    <Button
                      onClick={() => {
                        setShowComplementDialog(false);
                        setComplementMessage("");
                      }}
                      disabled={actionLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {showCancelDialog && (
                <div className="space-y-4 pt-4 border-t bg-gray-50 p-4 rounded">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Motivo do Cancelamento
                    </label>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Explique o motivo do cancelamento"
                      className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancel}
                      disabled={actionLoading || !cancelReason.trim()}
                      className="flex-1"
                      variant="destructive"
                    >
                      Confirmar Cancelamento
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCancelDialog(false);
                        setCancelReason("");
                      }}
                      disabled={actionLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      Voltar
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Exportar Dados da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Preencha os campos obrigatórios para realizar a exportação dos dados.
              </p>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Fundamento Legal *
                </label>
                <input
                  type="text"
                  value={exportLegalBasis}
                  onChange={(e) => setExportLegalBasis(e.target.value)}
                  placeholder="Ex: Art. 7, II, LGPD"
                  className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                  disabled={isExporting}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Motivo Operacional *
                </label>
                <textarea
                  value={exportOperationalReason}
                  onChange={(e) => setExportOperationalReason(e.target.value)}
                  placeholder="Descreva o motivo da exportação"
                  className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                  rows={3}
                  disabled={isExporting}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Notas do Revisor *
                </label>
                <textarea
                  value={exportReviewerNotes}
                  onChange={(e) => setExportReviewerNotes(e.target.value)}
                  placeholder="Justificativa de revisão e aprovação"
                  className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                  rows={3}
                  disabled={isExporting}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preciseLoc"
                  checked={exportIncludePreciseGeolocation}
                  onChange={(e) => setExportIncludePreciseGeolocation(e.target.checked)}
                  disabled={isExporting}
                  className="rounded"
                />
                <label htmlFor="preciseLoc" className="text-sm text-muted-foreground cursor-pointer">
                  Incluir geolocalização precisa
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportLegalBasis("");
                    setExportOperationalReason("");
                    setExportReviewerNotes("");
                    setExportIncludePreciseGeolocation(false);
                  }}
                  variant="outline"
                  disabled={isExporting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleExportRequest}
                  disabled={isExporting}
                  className="flex-1"
                >
                  {isExporting ? "Exportando..." : "Exportar Dados"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
