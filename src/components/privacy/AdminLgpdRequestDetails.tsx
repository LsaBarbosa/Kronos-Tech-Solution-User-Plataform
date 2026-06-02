import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, Clock, User, Building2, CheckCircle, XCircle, MessageSquare, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthenticatedPageLayout } from "@/components/layout/AuthenticatedPageLayout";
import { APP_PATHS } from "@/config/app-routes";
import { LGPD_REQUEST_TYPE_LABELS } from "@/constants/lgpd.constants";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import {
  getAdminRequestDetails,
  transitionRequestStatus,
  requestComplementFromDataSubject,
  cancelLgpdRequest,
  getAvailableTransitions,
  exportApprovedLgpdRequestData,
  getAnonymizationResult,
  type LgpdRequestDetailsResponse,
  type LgpdRequestStatus,
  type LgpdRequestType,
  type LgpdRequestTransitionPayload,
  type AnonymizationConsolidatedResultResponse,
} from "@/service/lgpd.service";
import { AdminAnonymizationWorkflow } from "@/components/privacy/AdminAnonymizationWorkflow";

const EXPORTABLE_REQUEST_TYPES: LgpdRequestType[] = [
  "ACCESS",
  "PORTABILITY",
  "SHARING_INFORMATION",
  "CONFIRM_PROCESSING",
];

const CLOSED_STATUSES: LgpdRequestStatus[] = [
  "COMPLETED",
  "REJECTED",
  "PARTIALLY_COMPLETED",
  "CANCELLED",
];

type PrimaryAction = {
  label: string;
  nextStatus: LgpdRequestStatus;
  description: string;
  publicNotes: string;
  internalNotes: string;
};

type FieldErrors = {
  approvalJustification?: string;
  approvalScope?: string;
  transitionStatus?: string;
  transitionNotes?: string;
  rejectionReason?: string;
  rejectionPublicNote?: string;
  complementMessage?: string;
  cancelReason?: string;
  completionPublicNotes?: string;
  exportLegalBasis?: string;
  exportOperationalReason?: string;
  exportReviewerNotes?: string;
};

const FieldError = ({ id, message }: { id: string; message?: string }) => {
  if (!message) return null;

  return (
    <p id={id} className="mt-1 text-xs text-destructive" role="alert">
      {message}
    </p>
  );
};

const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return "—";

  const date = dateString instanceof Date ? dateString : new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isExportableType = (type: string): type is LgpdRequestType =>
  EXPORTABLE_REQUEST_TYPES.includes(type as LgpdRequestType);

const getPrimaryAction = (
  status: LgpdRequestStatus,
  type: LgpdRequestType
): PrimaryAction | null => {
  switch (status) {
    case "OPEN":
      return {
        label: "Iniciar análise",
        nextStatus: "IN_ANALYSIS",
        description: "Marca a solicitação como em análise pela empresa.",
        publicNotes: "Solicitação recebida e análise iniciada pela empresa.",
        internalNotes: "Administrador iniciou a análise administrativa da solicitação LGPD.",
      };
    case "IN_ANALYSIS":
      return {
        label: "Enviar para revisão do controlador",
        nextStatus: "WAITING_CONTROLLER",
        description: "Encaminha a solicitação para validação da empresa controladora.",
        publicNotes: "Solicitação encaminhada para revisão da empresa controladora.",
        internalNotes: "Identidade, vínculo e escopo serão validados pela controladora.",
      };
    case "WAITING_CONTROLLER":
      return {
        label: "Enviar para revisão legal",
        nextStatus: "WAITING_LEGAL_REVIEW",
        description: "Encaminha a solicitação para revisão legal antes da aprovação.",
        publicNotes: "Solicitação encaminhada para revisão legal.",
        internalNotes: "Controladora concluiu a revisão inicial e solicitou validação legal.",
      };
    case "WAITING_LEGAL_REVIEW":
      if (isExportableType(type)) {
        return {
          label: "Aprovar exportação",
          nextStatus: "APPROVED_FOR_EXPORT",
          description: "Aprova a geração do pacote de dados do titular.",
          publicNotes:
            "Solicitação aprovada pela empresa controladora para exportação dos dados pessoais solicitados.",
          internalNotes: "Identidade e vínculo validados pelo administrador da empresa.",
        };
      }

      return {
        label: "Concluir solicitação",
        nextStatus: "COMPLETED",
        description: "Conclui a solicitação sem exportação de arquivo.",
        publicNotes: "Solicitação atendida conforme análise LGPD.",
        internalNotes: "Solicitação concluída sem necessidade de pacote de exportação.",
      };
    default:
      return null;
  }
};

const getWorkflowSteps = (status: LgpdRequestStatus, type: LgpdRequestType) => {
  const steps = !isExportableType(type)
    ? [
      { label: "Aberta", statuses: ["OPEN"] },
      { label: "Em análise", statuses: ["IN_ANALYSIS"] },
      { label: "Revisão", statuses: ["WAITING_CONTROLLER", "WAITING_LEGAL_REVIEW", "WAITING_DATA_SUBJECT"] },
      { label: "Concluída", statuses: ["COMPLETED", "PARTIALLY_COMPLETED"] },
      ]
    : [
      { label: "Aberta", statuses: ["OPEN"] },
      { label: "Em análise", statuses: ["IN_ANALYSIS"] },
      { label: "Revisão do controlador", statuses: ["WAITING_CONTROLLER"] },
      { label: "Revisão legal", statuses: ["WAITING_LEGAL_REVIEW", "WAITING_DATA_SUBJECT"] },
      { label: "Aprovada para exportação", statuses: ["APPROVED_FOR_EXPORT"] },
      { label: "Concluída", statuses: ["COMPLETED", "PARTIALLY_COMPLETED"] },
    ];

  return steps.map((step) => ({
    ...step,
    current: step.statuses.includes(status),
  }));
};

export const AdminLgpdRequestDetails = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [request, setRequest] = useState<LgpdRequestDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionPublicNote, setRejectionPublicNote] = useState("");
  const [rejectionInternalNote, setRejectionInternalNote] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
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
  const [anonymizationResult, setAnonymizationResult] = useState<AnonymizationConsolidatedResultResponse | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalJustification, setApprovalJustification] = useState("");
  const [approvalScope, setApprovalScope] = useState("");
  const [approvalInternalNotes, setApprovalInternalNotes] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionPublicNotes, setCompletionPublicNotes] = useState("");
  const [completionInternalNotes, setCompletionInternalNotes] = useState("");
  const [hasExportedReviewedData, setHasExportedReviewedData] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const fieldRefs = useRef<Partial<Record<keyof FieldErrors, HTMLElement | null>>>({});

  const setFieldRef =
    (field: keyof FieldErrors) =>
    (element: HTMLElement | null) => {
      fieldRefs.current[field] = element;
    };

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const focusFirstInvalidField = (errors: FieldErrors) => {
    const firstField = Object.keys(errors)[0] as keyof FieldErrors | undefined;
    if (!firstField) return;
    window.setTimeout(() => fieldRefs.current[firstField]?.focus(), 0);
  };

  const applyFieldErrors = (errors: FieldErrors, message: string) => {
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(errors);
      toast.error(message);
      return false;
    }

    return true;
  };

  const fieldClassName = (field: keyof FieldErrors) =>
    cn(
      "w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground",
      fieldErrors[field] && "border-destructive focus-visible:ring-destructive"
    );

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

        // Load anonymization result if available
        const anonResult = await getAnonymizationResult(requestId);
        if (anonResult) {
          setAnonymizationResult({
            ...anonResult,
            startedAt: new Date(anonResult.startedAt),
            finishedAt: new Date(anonResult.finishedAt),
          });
        }
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
      <AuthenticatedPageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthenticatedPageLayout>
    );
  }

  if (error || !request) {
    return (
      <AuthenticatedPageLayout>
        <div className="flex items-center justify-center min-h-[60vh] bg-red-50 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar</h2>
            <p className="text-red-700 mb-4">{error || "Solicitação não encontrada"}</p>
            <Button onClick={() => navigate(APP_PATHS.lgpdAdminRequests)}>
              Voltar para Lista
            </Button>
          </div>
        </div>
      </AuthenticatedPageLayout>
    );
  }

  const getStatusColor = (status: LgpdRequestStatus) => {
    const colors: Record<LgpdRequestStatus, string> = {
      OPEN: "bg-blue-50 text-blue-700 border-blue-200",
      IN_ANALYSIS: "bg-blue-100 text-blue-800 border-blue-200",
      WAITING_CONTROLLER: "bg-blue-900/10 text-blue-900 border-blue-200",
      WAITING_LEGAL_REVIEW: "bg-slate-100 text-slate-700 border-slate-200",
      APPROVED_FOR_EXPORT: "bg-green-50 text-green-700 border-green-200",
      WAITING_DATA_SUBJECT: "bg-blue-50 text-blue-700 border-blue-200",
      COMPLETED: "bg-green-50 text-green-700 border-green-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
      PARTIALLY_COMPLETED: "bg-amber-50 text-amber-700 border-amber-200",
      CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
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

  const refreshRequest = async () => {
    if (!requestId) return;

    const updated = await getAdminRequestDetails(requestId);
    setRequest(updated);
  };

  const performStatusTransition = async (
    payload: LgpdRequestTransitionPayload,
    successMessage: string
  ): Promise<boolean> => {
    if (!requestId) {
      toast.error("ID da solicitação não disponível");
      return false;
    }

    try {
      setActionLoading(true);
      await transitionRequestStatus(requestId, payload);
      toast.success(successMessage);
      await refreshRequest();
      return true;
    } catch (err) {
      toast.error(getServiceErrorMessage(err, "Não foi possível avançar a solicitação."));
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const openApprovalDialog = (action: PrimaryAction) => {
    setApprovalJustification("");
    setApprovalScope("");
    setApprovalInternalNotes(action.internalNotes);
    setFieldErrors({});
    setShowApprovalDialog(true);
  };

  const openCompletionDialog = (action?: PrimaryAction) => {
    setCompletionPublicNotes(
      action?.publicNotes || "Dados exportados e disponibilizados conforme solicitação LGPD."
    );
    setCompletionInternalNotes(
      action?.internalNotes ||
        "Exportação administrativa executada após aprovação da empresa controladora."
    );
    setFieldErrors({});
    setShowCompletionDialog(true);
  };

  const handlePrimaryAction = async (action: PrimaryAction) => {
    if (action.nextStatus === "APPROVED_FOR_EXPORT") {
      openApprovalDialog(action);
      return;
    }

    if (action.nextStatus === "COMPLETED") {
      openCompletionDialog(action);
      return;
    }

    await performStatusTransition(
      {
        newStatus: action.nextStatus,
        publicNotes: action.publicNotes,
        internalNotes: action.internalNotes,
      },
      "Solicitação avançada com sucesso!"
    );
  };

  const handleApproveExport = async () => {
    const errors: FieldErrors = {};

    if (!approvalJustification.trim()) {
      errors.approvalJustification = "Informe a justificativa da aprovação.";
    }

    if (!approvalScope.trim()) {
      errors.approvalScope = "Informe o escopo aprovado.";
    }

    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    const transitioned = await performStatusTransition(
      {
        newStatus: "APPROVED_FOR_EXPORT",
        publicNotes: approvalJustification.trim(),
        internalNotes: [
          `Escopo aprovado: ${approvalScope.trim()}`,
          approvalInternalNotes.trim()
            ? `Observações internas: ${approvalInternalNotes.trim()}`
            : "Observações internas: Identidade e vínculo validados pelo administrador da empresa.",
        ].join("\n"),
      },
      "Exportação aprovada com sucesso!"
    );

    if (transitioned) {
      setShowApprovalDialog(false);
      setFieldErrors({});
    }
  };

  const handleCompleteAfterExport = async () => {
    const errors: FieldErrors = {};

    if (!completionPublicNotes.trim()) {
      errors.completionPublicNotes = "Informe a nota pública de conclusão.";
    }

    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    const transitioned = await performStatusTransition(
      {
        newStatus: "COMPLETED",
        publicNotes: completionPublicNotes.trim(),
        internalNotes:
          completionInternalNotes.trim() ||
          "Exportação administrativa executada após aprovação da empresa controladora.",
      },
      "Solicitação concluída com sucesso!"
    );

    if (transitioned) {
      setShowCompletionDialog(false);
      setFieldErrors({});
    }
  };

  const handleReject = async () => {
    const errors: FieldErrors = {};

    if (!rejectionReason.trim()) {
      errors.rejectionReason = "Informe o motivo da rejeição.";
    }

    if (!rejectionPublicNote.trim()) {
      errors.rejectionPublicNote = "Informe a nota pública de rejeição.";
    }

    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    const transitioned = await performStatusTransition(
      {
        newStatus: "REJECTED",
        closedReason: rejectionReason.trim(),
        publicNotes: rejectionPublicNote.trim(),
        internalNotes: rejectionInternalNote.trim() || undefined,
      },
      "Solicitação rejeitada com sucesso!"
    );

    if (transitioned) {
      setShowRejectDialog(false);
      setRejectionReason("");
      setRejectionPublicNote("");
      setRejectionInternalNote("");
      setFieldErrors({});
    }
  };

  const handleTransition = async () => {
    const errors: FieldErrors = {};

    if (!selectedTransition) {
      errors.transitionStatus = "Selecione a próxima etapa.";
    }

    if (selectedTransition === "REJECTED" && !rejectionReason.trim()) {
      errors.rejectionReason = "Informe o motivo da rejeição.";
    }

    if (["COMPLETED", "PARTIALLY_COMPLETED"].includes(selectedTransition || "") && !transitionNotes.trim()) {
      errors.transitionNotes = "Informe as notas de resolução.";
    }

    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
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

    const transitioned = await performStatusTransition(payload, "Solicitação avançada com sucesso!");

    if (transitioned) {
      setShowTransitionDialog(false);
      setSelectedTransition(null);
      setTransitionNotes("");
      setRejectionReason("");
      setFieldErrors({});
    }
  };

  const handleRequestComplement = async () => {
    if (!requestId) {
      toast.error("ID da solicitação não disponível");
      return;
    }

    const errors: FieldErrors = {};

    if (!complementMessage.trim()) {
      errors.complementMessage = "Informe a mensagem de solicitação.";
    }

    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    try {
      setActionLoading(true);
      await requestComplementFromDataSubject(requestId, {
        message: complementMessage.trim(),
      });
      toast.success("Solicitação de complemento enviada com sucesso!");
      await refreshRequest();
      setShowComplementDialog(false);
      setComplementMessage("");
      setFieldErrors({});
    } catch (err) {
      toast.error(getServiceErrorMessage(err, "Não foi possível solicitar complemento."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!requestId) {
      toast.error("ID da solicitação não disponível");
      return;
    }

    const errors: FieldErrors = {};

    if (!cancelReason.trim()) {
      errors.cancelReason = "Informe o motivo do cancelamento.";
    }

    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    try {
      setActionLoading(true);
      await cancelLgpdRequest(requestId, { reason: cancelReason.trim() });
      toast.success("Solicitação cancelada com sucesso!");
      await refreshRequest();
      setShowCancelDialog(false);
      setCancelReason("");
      setFieldErrors({});
    } catch (err) {
      toast.error(getServiceErrorMessage(err, "Não foi possível cancelar a solicitação."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportRequest = async () => {
    if (!requestId) {
      toast.error("ID da solicitação não disponível");
      return;
    }

    const errors: FieldErrors = {};

    if (!exportLegalBasis.trim()) {
      errors.exportLegalBasis = "Informe o fundamento legal.";
    }

    if (!exportOperationalReason.trim()) {
      errors.exportOperationalReason = "Informe o motivo operacional.";
    }

    if (!exportReviewerNotes.trim()) {
      errors.exportReviewerNotes = "Informe as notas do revisor.";
    }

    if (!applyFieldErrors(errors, "Revise os campos obrigatórios da exportação.")) {
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
      setHasExportedReviewedData(true);
      setShowExportModal(false);
      setExportLegalBasis("");
      setExportOperationalReason("");
      setExportReviewerNotes("");
      setExportIncludePreciseGeolocation(false);
      setFieldErrors({});

      if (requestId) {
        const updated = await getAdminRequestDetails(requestId);
        setRequest(updated);
      }
    } catch (err) {
      toast.error(getServiceErrorMessage(err, "Não foi possível exportar os dados."));
    } finally {
      setIsExporting(false);
    }
  };

  const currentStatus = request.request.status;
  const requestType = request.request.requestType;
  const primaryAction = getPrimaryAction(currentStatus, requestType);
  const isClosedStatus = CLOSED_STATUSES.includes(currentStatus);
  const isApprovedForExport = currentStatus === "APPROVED_FOR_EXPORT" && isExportableType(requestType);
  const canShowCancelAction = role === "CTO" && !isClosedStatus;
  const availableAdvancedTransitions = getAvailableTransitions(currentStatus).filter(
    (status) => role === "CTO" || status !== "CANCELLED"
  );
  const workflowSteps = getWorkflowSteps(currentStatus, requestType);

  return (
    <AuthenticatedPageLayout>
    <div className="space-y-6">
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
          <Card>
            <CardHeader>
              <CardTitle>Fluxo da Solicitação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {workflowSteps.map((step, index) => {
                  const completed = workflowSteps.findIndex((item) => item.current) > index;

                  return (
                    <div
                      key={step.label}
                      className={`rounded border p-3 ${
                        step.current
                          ? "border-primary bg-primary/10"
                          : completed
                            ? "border-green-200 bg-green-50"
                            : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            step.current
                              ? "bg-primary text-primary-foreground"
                              : completed
                                ? "bg-success text-success-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{step.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Request Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                  <p className="text-sm font-medium text-foreground">
                    {LGPD_REQUEST_TYPE_LABELS[request.request.requestType]}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(request.request.status)}`}>
                    {getStatusLabel(request.request.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de Criação</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(request.request.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Última Atualização</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(request.request.updatedAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                <p className="text-sm text-foreground bg-muted/60 p-3 rounded border border-border">
                  {request.request.description}
                </p>
              </div>
              {request.request.resolutionNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notas de Resolução</p>
                  <p className="text-sm text-foreground bg-muted/60 p-3 rounded border border-border">
                    {request.request.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Anonymization Workflow for ANONYMIZATION/DELETION requests */}
              {["ANONYMIZATION", "DELETION"].includes(request.request.requestType) && (
                <div className="pt-4 border-t">
                  <AdminAnonymizationWorkflow
                    requestId={requestId || ""}
                    requestType={request.request.requestType}
                    requestStatus={request.request.status}
                    employeeFullName={request.employee.fullName}
                    onAnonymizationComplete={(result) => {
                      setAnonymizationResult(result);
                      toast.success("Anonimização concluída com sucesso!");
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações da Empresa Controladora</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Analise, aprove, rejeite ou conclua a solicitação do titular conforme o fluxo LGPD.
                  </p>
                </div>

                {isApprovedForExport && (
                  <div className="rounded border border-green-200 bg-green-50 p-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-green-900">Exportação aprovada</p>
                      <p className="text-sm text-green-800">
                        Agora você pode gerar o pacote de dados revisado para atendimento da solicitação.
                      </p>
                      {hasExportedReviewedData && (
                        <p className="text-sm text-green-800 mt-2">
                          Exportação executada nesta sessão. Revise o arquivo antes de concluir.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => {
                          setFieldErrors({});
                          setShowExportModal(true);
                        }}
                        disabled={isExporting}
                        className="gap-2"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                        Exportar dados revisados
                      </Button>
                      <Button
                        onClick={() => openCompletionDialog()}
                        disabled={actionLoading}
                        variant="success"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Concluir solicitação
                      </Button>
                    </div>
                  </div>
                )}

                {!isClosedStatus && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {primaryAction && !isApprovedForExport && (
                      <Button
                        onClick={() => handlePrimaryAction(primaryAction)}
                        disabled={actionLoading}
                        size="sm"
                        className="justify-start"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {primaryAction.label}
                      </Button>
                    )}
                    {request.request.status === "WAITING_DATA_SUBJECT" && (
                      <Button
                        onClick={() => {
                          setFieldErrors({});
                          setShowComplementDialog(true);
                        }}
                        disabled={actionLoading}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Solicitar Complemento
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setFieldErrors({});
                        setShowRejectDialog(true);
                      }}
                      disabled={actionLoading}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeitar solicitação
                    </Button>
                    {canShowCancelAction && (
                      <Button
                        onClick={() => {
                          setFieldErrors({});
                          setShowCancelDialog(true);
                        }}
                        disabled={actionLoading}
                        variant="outline"
                        size="sm"
                        className="justify-start"
                      >
                        Cancelar solicitação
                      </Button>
                    )}
                  </div>
                )}

                {primaryAction && !isApprovedForExport && (
                  <p className="text-xs text-muted-foreground">
                    {primaryAction.description}
                  </p>
                )}

                {!isClosedStatus && availableAdvancedTransitions.length > 0 && (
                  <div className="rounded border border-dashed p-3 space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Ações avançadas</p>
                      <p className="text-xs text-muted-foreground">
                        Use somente quando precisar selecionar uma etapa técnica manualmente.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setFieldErrors({});
                        setShowTransitionDialog(true);
                      }}
                      disabled={actionLoading}
                      variant="outline"
                      size="sm"
                    >
                      Avançar análise manualmente
                    </Button>
                  </div>
                )}
              </div>

              {showApprovalDialog && (
                <div className="space-y-4 pt-4 border-t bg-muted/60 p-4 rounded">
                  <div>
                    <p className="text-sm font-medium text-foreground">Registrar aprovação</p>
                    <p className="text-sm text-muted-foreground">
                      Registre a justificativa e o escopo aprovado antes de liberar a exportação.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Justificativa da aprovação *
                    </label>
                    <textarea
                      ref={setFieldRef("approvalJustification")}
                      value={approvalJustification}
                      onChange={(e) => {
                        setApprovalJustification(e.target.value);
                        clearFieldError("approvalJustification");
                      }}
                      aria-invalid={!!fieldErrors.approvalJustification}
                      aria-describedby={
                        fieldErrors.approvalJustification
                          ? "approvalJustification-error"
                          : undefined
                      }
                      className={fieldClassName("approvalJustification")}
                      rows={3}
                      disabled={actionLoading}
                    />
                    <FieldError
                      id="approvalJustification-error"
                      message={fieldErrors.approvalJustification}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Escopo aprovado *
                    </label>
                    <textarea
                      ref={setFieldRef("approvalScope")}
                      value={approvalScope}
                      onChange={(e) => {
                        setApprovalScope(e.target.value);
                        clearFieldError("approvalScope");
                      }}
                      aria-invalid={!!fieldErrors.approvalScope}
                      aria-describedby={fieldErrors.approvalScope ? "approvalScope-error" : undefined}
                      className={fieldClassName("approvalScope")}
                      rows={3}
                      disabled={actionLoading}
                    />
                    <FieldError id="approvalScope-error" message={fieldErrors.approvalScope} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Observações internas
                    </label>
                    <textarea
                      value={approvalInternalNotes}
                      onChange={(e) => setApprovalInternalNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                      rows={3}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApproveExport}
                      disabled={actionLoading}
                      className="flex-1"
                      variant="success"
                    >
                      Confirmar aprovação
                    </Button>
                    <Button
                      onClick={() => {
                        setShowApprovalDialog(false);
                        setFieldErrors({});
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

              {showCompletionDialog && (
                <div className="space-y-4 pt-4 border-t bg-muted/60 p-4 rounded">
                  <div>
                    <p className="text-sm font-medium text-foreground">Concluir solicitação</p>
                    <p className="text-sm text-muted-foreground">
                      Informe a nota pública que ficará visível para o titular.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Nota pública *
                    </label>
                    <textarea
                      ref={setFieldRef("completionPublicNotes")}
                      value={completionPublicNotes}
                      onChange={(e) => {
                        setCompletionPublicNotes(e.target.value);
                        clearFieldError("completionPublicNotes");
                      }}
                      aria-invalid={!!fieldErrors.completionPublicNotes}
                      aria-describedby={
                        fieldErrors.completionPublicNotes
                          ? "completionPublicNotes-error"
                          : undefined
                      }
                      className={fieldClassName("completionPublicNotes")}
                      rows={3}
                      disabled={actionLoading}
                    />
                    <FieldError
                      id="completionPublicNotes-error"
                      message={fieldErrors.completionPublicNotes}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Observações internas
                    </label>
                    <textarea
                      value={completionInternalNotes}
                      onChange={(e) => setCompletionInternalNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                      rows={3}
                      disabled={actionLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCompleteAfterExport}
                      disabled={actionLoading}
                      className="flex-1"
                      variant="success"
                    >
                      Concluir solicitação
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCompletionDialog(false);
                        setFieldErrors({});
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

              {showRejectDialog && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-4 bg-muted/60 p-4 rounded">
                    <div>
                      <p className="text-sm font-medium text-foreground">Rejeitar solicitação</p>
                      <p className="text-sm text-muted-foreground">
                        Registre o motivo e uma nota pública compreensível para o titular.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Motivo da rejeição *
                      </label>
                      <input
                        ref={setFieldRef("rejectionReason")}
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => {
                          setRejectionReason(e.target.value);
                          clearFieldError("rejectionReason");
                        }}
                        placeholder="Ex: Solicitação inválida"
                        aria-invalid={!!fieldErrors.rejectionReason}
                        aria-describedby={
                          fieldErrors.rejectionReason ? "rejectionReason-error" : undefined
                        }
                        className={fieldClassName("rejectionReason")}
                        disabled={actionLoading}
                      />
                      <FieldError id="rejectionReason-error" message={fieldErrors.rejectionReason} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Nota pública *
                      </label>
                      <textarea
                        ref={setFieldRef("rejectionPublicNote")}
                        value={rejectionPublicNote}
                        onChange={(e) => {
                          setRejectionPublicNote(e.target.value);
                          clearFieldError("rejectionPublicNote");
                        }}
                        placeholder="Explique a rejeição em linguagem clara para o titular."
                        aria-invalid={!!fieldErrors.rejectionPublicNote}
                        aria-describedby={
                          fieldErrors.rejectionPublicNote
                            ? "rejectionPublicNote-error"
                            : undefined
                        }
                        className={fieldClassName("rejectionPublicNote")}
                        rows={3}
                        disabled={actionLoading}
                      />
                      <FieldError
                        id="rejectionPublicNote-error"
                        message={fieldErrors.rejectionPublicNote}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Observações internas
                      </label>
                      <textarea
                        value={rejectionInternalNote}
                        onChange={(e) => setRejectionInternalNote(e.target.value)}
                        placeholder="Observações internas da revisão"
                        className="w-full px-3 py-2 text-sm border rounded bg-white text-foreground placeholder-muted-foreground"
                        rows={3}
                        disabled={actionLoading}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="flex-1"
                        variant="destructive"
                      >
                        Confirmar rejeição
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRejectDialog(false);
                          setRejectionReason("");
                          setRejectionPublicNote("");
                          setRejectionInternalNote("");
                          setFieldErrors({});
                        }}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {showTransitionDialog && (
                <div className="space-y-4 pt-4 border-t bg-muted/60 p-4 rounded">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Próxima etapa
                    </label>
                    <select
                      ref={setFieldRef("transitionStatus")}
                      value={selectedTransition || ""}
                      onChange={(e) => {
                        setSelectedTransition(e.target.value as LgpdRequestStatus);
                        clearFieldError("transitionStatus");
                      }}
                      aria-invalid={!!fieldErrors.transitionStatus}
                      aria-describedby={
                        fieldErrors.transitionStatus ? "transitionStatus-error" : undefined
                      }
                      className={fieldClassName("transitionStatus")}
                      disabled={actionLoading}
                    >
                      <option value="">Selecione a próxima etapa</option>
                      {availableAdvancedTransitions.map((status) => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                    <FieldError id="transitionStatus-error" message={fieldErrors.transitionStatus} />
                  </div>

                  {selectedTransition === "REJECTED" && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Motivo da Rejeição
                      </label>
                      <input
                        ref={setFieldRef("rejectionReason")}
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => {
                          setRejectionReason(e.target.value);
                          clearFieldError("rejectionReason");
                        }}
                        placeholder="Ex: Solicitação inválida"
                        aria-invalid={!!fieldErrors.rejectionReason}
                        aria-describedby={
                          fieldErrors.rejectionReason ? "rejectionReason-error" : undefined
                        }
                        className={fieldClassName("rejectionReason")}
                        disabled={actionLoading}
                      />
                      <FieldError id="rejectionReason-error" message={fieldErrors.rejectionReason} />
                    </div>
                  )}

                  {["COMPLETED", "PARTIALLY_COMPLETED"].includes(selectedTransition || "") && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Notas de Resolução
                      </label>
                      <textarea
                        ref={setFieldRef("transitionNotes")}
                        value={transitionNotes}
                        onChange={(e) => {
                          setTransitionNotes(e.target.value);
                          clearFieldError("transitionNotes");
                        }}
                        placeholder="Descreva a resolução"
                        aria-invalid={!!fieldErrors.transitionNotes}
                        aria-describedby={
                          fieldErrors.transitionNotes ? "transitionNotes-error" : undefined
                        }
                        className={fieldClassName("transitionNotes")}
                        rows={3}
                        disabled={actionLoading}
                      />
                      <FieldError id="transitionNotes-error" message={fieldErrors.transitionNotes} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleTransition}
                      disabled={actionLoading}
                      className="flex-1"
                      variant="default"
                    >
                      Confirmar avanço
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTransitionDialog(false);
                        setSelectedTransition(null);
                        setTransitionNotes("");
                        setRejectionReason("");
                        setFieldErrors({});
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
                <div className="space-y-4 pt-4 border-t bg-muted/60 p-4 rounded">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Mensagem de Solicitação
                    </label>
                    <textarea
                      ref={setFieldRef("complementMessage")}
                      value={complementMessage}
                      onChange={(e) => {
                        setComplementMessage(e.target.value);
                        clearFieldError("complementMessage");
                      }}
                      placeholder="Descreva quais informações adicionais são necessárias"
                      aria-invalid={!!fieldErrors.complementMessage}
                      aria-describedby={
                        fieldErrors.complementMessage ? "complementMessage-error" : undefined
                      }
                      className={fieldClassName("complementMessage")}
                      rows={4}
                      disabled={actionLoading}
                    />
                    <FieldError id="complementMessage-error" message={fieldErrors.complementMessage} />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRequestComplement}
                      disabled={actionLoading}
                      className="flex-1"
                      variant="default"
                    >
                      Enviar Solicitação
                    </Button>
                    <Button
                      onClick={() => {
                        setShowComplementDialog(false);
                        setComplementMessage("");
                        setFieldErrors({});
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
                <div className="space-y-4 pt-4 border-t bg-muted/60 p-4 rounded">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Motivo do Cancelamento
                    </label>
                    <input
                      ref={setFieldRef("cancelReason")}
                      type="text"
                      value={cancelReason}
                      onChange={(e) => {
                        setCancelReason(e.target.value);
                        clearFieldError("cancelReason");
                      }}
                      placeholder="Explique o motivo do cancelamento"
                      aria-invalid={!!fieldErrors.cancelReason}
                      aria-describedby={fieldErrors.cancelReason ? "cancelReason-error" : undefined}
                      className={fieldClassName("cancelReason")}
                      disabled={actionLoading}
                    />
                    <FieldError id="cancelReason-error" message={fieldErrors.cancelReason} />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="flex-1"
                      variant="destructive"
                    >
                      Confirmar Cancelamento
                    </Button>
                    <Button
                      onClick={() => {
                        setShowCancelDialog(false);
                        setCancelReason("");
                        setFieldErrors({});
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
                        borderLeft: index !== request.history.length - 1 ? "2px solid hsl(var(--border))" : "none",
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
                          <p className="text-sm text-foreground mt-2 bg-muted/60 p-2 rounded">
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
                  ref={setFieldRef("exportLegalBasis")}
                  type="text"
                  value={exportLegalBasis}
                  onChange={(e) => {
                    setExportLegalBasis(e.target.value);
                    clearFieldError("exportLegalBasis");
                  }}
                  placeholder="Ex: Art. 7, II, LGPD"
                  aria-invalid={!!fieldErrors.exportLegalBasis}
                  aria-describedby={
                    fieldErrors.exportLegalBasis ? "exportLegalBasis-error" : undefined
                  }
                  className={fieldClassName("exportLegalBasis")}
                  disabled={isExporting}
                />
                <FieldError id="exportLegalBasis-error" message={fieldErrors.exportLegalBasis} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Motivo Operacional *
                </label>
                <textarea
                  ref={setFieldRef("exportOperationalReason")}
                  value={exportOperationalReason}
                  onChange={(e) => {
                    setExportOperationalReason(e.target.value);
                    clearFieldError("exportOperationalReason");
                  }}
                  placeholder="Descreva o motivo da exportação"
                  aria-invalid={!!fieldErrors.exportOperationalReason}
                  aria-describedby={
                    fieldErrors.exportOperationalReason
                      ? "exportOperationalReason-error"
                      : undefined
                  }
                  className={fieldClassName("exportOperationalReason")}
                  rows={3}
                  disabled={isExporting}
                />
                <FieldError
                  id="exportOperationalReason-error"
                  message={fieldErrors.exportOperationalReason}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Notas do Revisor *
                </label>
                <textarea
                  ref={setFieldRef("exportReviewerNotes")}
                  value={exportReviewerNotes}
                  onChange={(e) => {
                    setExportReviewerNotes(e.target.value);
                    clearFieldError("exportReviewerNotes");
                  }}
                  placeholder="Justificativa de revisão e aprovação"
                  aria-invalid={!!fieldErrors.exportReviewerNotes}
                  aria-describedby={
                    fieldErrors.exportReviewerNotes ? "exportReviewerNotes-error" : undefined
                  }
                  className={fieldClassName("exportReviewerNotes")}
                  rows={3}
                  disabled={isExporting}
                />
                <FieldError id="exportReviewerNotes-error" message={fieldErrors.exportReviewerNotes} />
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
                    setFieldErrors({});
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
    </AuthenticatedPageLayout>
  );
};
