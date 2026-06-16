import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { APP_PATHS } from "@/config/app-routes";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import {
  cancelLgpdRequest,
  exportApprovedLgpdRequestData,
  getAdminRequestDetails,
  getAnonymizationResult,
  getAvailableTransitions,
  requestComplementFromDataSubject,
  transitionRequestStatus,
  type AnonymizationConsolidatedResultResponse,
  type LgpdRequestDetailsResponse,
  type LgpdRequestStatus,
  type LgpdRequestTransitionPayload,
  type LgpdRequestType,
} from "@/service/lgpd.service";
import {
  canRoleCancel,
  filterAdvancedTransitions,
  getPrimaryAction,
  getWorkflowSteps,
  isClosedStatus,
  isExportableType,
  type PrimaryAction,
  type WorkflowStep,
} from "../utils/lgpdCaseFormatters";

export type FieldErrors = {
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

export type DialogId =
  | "approval"
  | "completion"
  | "reject"
  | "transition"
  | "complement"
  | "cancel"
  | "export"
  | null;

export interface ApprovalDraft {
  justification: string;
  scope: string;
  internalNotes: string;
}

export interface CompletionDraft {
  publicNotes: string;
  internalNotes: string;
}

export interface RejectDraft {
  reason: string;
  publicNote: string;
  internalNote: string;
}

export interface TransitionDraft {
  nextStatus: LgpdRequestStatus | null;
  notes: string;
  rejectionReason: string;
}

export interface ExportDraft {
  legalBasis: string;
  operationalReason: string;
  reviewerNotes: string;
  includePreciseGeolocation: boolean;
}

const INITIAL_APPROVAL: ApprovalDraft = {
  justification: "",
  scope: "",
  internalNotes: "",
};

const INITIAL_COMPLETION: CompletionDraft = {
  publicNotes: "",
  internalNotes: "",
};

const INITIAL_REJECT: RejectDraft = {
  reason: "",
  publicNote: "",
  internalNote: "",
};

const INITIAL_TRANSITION: TransitionDraft = {
  nextStatus: null,
  notes: "",
  rejectionReason: "",
};

const INITIAL_EXPORT: ExportDraft = {
  legalBasis: "",
  operationalReason: "",
  reviewerNotes: "",
  includePreciseGeolocation: false,
};

export interface UseLgpdCaseDetailsReturn {
  // Identity & loading
  requestId: string | undefined;
  request: LgpdRequestDetailsResponse | null;
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  isExporting: boolean;
  hasExportedReviewedData: boolean;
  anonymizationResult: AnonymizationConsolidatedResultResponse | null;
  setAnonymizationResult: (result: AnonymizationConsolidatedResultResponse | null) => void;

  // Derived
  primaryAction: PrimaryAction | null;
  isExportable: boolean;
  isClosed: boolean;
  isApprovedForExport: boolean;
  canShowCancelAction: boolean;
  availableAdvancedTransitions: LgpdRequestStatus[];
  workflowSteps: WorkflowStep[];

  // Dialogs
  openDialog: DialogId;
  showDialog: (dialog: NonNullable<DialogId>) => void;
  closeDialog: () => void;

  // Drafts
  approvalDraft: ApprovalDraft;
  updateApprovalDraft: (patch: Partial<ApprovalDraft>) => void;
  completionDraft: CompletionDraft;
  updateCompletionDraft: (patch: Partial<CompletionDraft>) => void;
  rejectDraft: RejectDraft;
  updateRejectDraft: (patch: Partial<RejectDraft>) => void;
  transitionDraft: TransitionDraft;
  updateTransitionDraft: (patch: Partial<TransitionDraft>) => void;
  complementMessage: string;
  setComplementMessage: (value: string) => void;
  cancelReason: string;
  setCancelReason: (value: string) => void;
  exportDraft: ExportDraft;
  updateExportDraft: (patch: Partial<ExportDraft>) => void;

  // Errors
  fieldErrors: FieldErrors;
  clearFieldError: (field: keyof FieldErrors) => void;

  // Primary actions
  handlePrimaryAction: () => Promise<void>;
  handleApproveExport: () => Promise<void>;
  handleCompletion: () => Promise<void>;
  handleReject: () => Promise<void>;
  handleTransition: () => Promise<void>;
  handleRequestComplement: () => Promise<void>;
  handleCancel: () => Promise<void>;
  handleExport: () => Promise<void>;
  handleOpenExportDialog: () => void;
  handleOpenCompletionDialog: () => void;

  // Navigation
  goBack: () => void;
  refreshRequest: () => Promise<void>;
}

export const useLgpdCaseDetails = (): UseLgpdCaseDetailsReturn => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [request, setRequest] = useState<LgpdRequestDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasExportedReviewedData, setHasExportedReviewedData] = useState(false);
  const [anonymizationResult, setAnonymizationResult] =
    useState<AnonymizationConsolidatedResultResponse | null>(null);

  const [openDialog, setOpenDialog] = useState<DialogId>(null);
  const [approvalDraft, setApprovalDraft] = useState<ApprovalDraft>(INITIAL_APPROVAL);
  const [completionDraft, setCompletionDraft] = useState<CompletionDraft>(INITIAL_COMPLETION);
  const [rejectDraft, setRejectDraft] = useState<RejectDraft>(INITIAL_REJECT);
  const [transitionDraft, setTransitionDraft] = useState<TransitionDraft>(INITIAL_TRANSITION);
  const [complementMessage, setComplementMessage] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [exportDraft, setExportDraft] = useState<ExportDraft>(INITIAL_EXPORT);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isFetchingRef = useRef(false);

  // Initial load
  useEffect(() => {
    let isActive = true;

    const fetchDetails = async () => {
      if (!requestId) {
        setError("ID da solicitação não encontrado");
        setLoading(false);
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        setLoading(true);
        setError(null);
        const data = await getAdminRequestDetails(requestId);
        if (!isActive) return;
        setRequest(data);

        const anonResult = await getAnonymizationResult(requestId);
        if (isActive && anonResult) {
          setAnonymizationResult(anonResult);
        }
      } catch (err) {
        if (isActive) {
          setError(getServiceErrorMessage(err, "Erro ao carregar detalhes"));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
        isFetchingRef.current = false;
      }
    };

    void fetchDetails();
    return () => {
      isActive = false;
    };
  }, [requestId]);

  const refreshRequest = useCallback(async () => {
    if (!requestId) return;
    const updated = await getAdminRequestDetails(requestId);
    setRequest(updated);
  }, [requestId]);

  const closeDialog = useCallback(() => {
    setOpenDialog(null);
    setFieldErrors({});
  }, []);

  const showDialog = useCallback((dialog: NonNullable<DialogId>) => {
    setFieldErrors({});
    setOpenDialog(dialog);
  }, []);

  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const applyFieldErrors = useCallback(
    (errors: FieldErrors, message: string): boolean => {
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        toast.error(message);
        return false;
      }
      setFieldErrors({});
      return true;
    },
    []
  );

  const updateApprovalDraft = useCallback((patch: Partial<ApprovalDraft>) => {
    setApprovalDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateCompletionDraft = useCallback((patch: Partial<CompletionDraft>) => {
    setCompletionDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateRejectDraft = useCallback((patch: Partial<RejectDraft>) => {
    setRejectDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateTransitionDraft = useCallback((patch: Partial<TransitionDraft>) => {
    setTransitionDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateExportDraft = useCallback((patch: Partial<ExportDraft>) => {
    setExportDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const currentStatus = (request?.request.status ?? null) as LgpdRequestStatus | null;
  const requestType = (request?.request.requestType ?? null) as LgpdRequestType | null;

  const primaryAction = useMemo<PrimaryAction | null>(
    () => (currentStatus && requestType ? getPrimaryAction(currentStatus, requestType) : null),
    [currentStatus, requestType]
  );

  const isExportable = isExportableType(requestType ?? "");
  const isClosed = isClosedStatus(currentStatus);
  const isApprovedForExport = currentStatus === "APPROVED_FOR_EXPORT" && isExportable;
  const canShowCancelAction = canRoleCancel(role) && !isClosed && Boolean(currentStatus);

  const availableAdvancedTransitions = useMemo(
    () =>
      currentStatus
        ? filterAdvancedTransitions(getAvailableTransitions(currentStatus), role)
        : [],
    [currentStatus, role]
  );

  const workflowSteps = useMemo(
    () =>
      currentStatus && requestType
        ? getWorkflowSteps(currentStatus, requestType)
        : ([] as WorkflowStep[]),
    [currentStatus, requestType]
  );

  const performTransition = useCallback(
    async (payload: LgpdRequestTransitionPayload, successMessage: string): Promise<boolean> => {
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
    },
    [refreshRequest, requestId]
  );

  // ----- Primary actions -----

  const handleOpenCompletionDialog = useCallback(() => {
    setCompletionDraft({
      publicNotes:
        primaryAction?.publicNotes ||
        "Dados exportados e disponibilizados conforme solicitação LGPD.",
      internalNotes:
        primaryAction?.internalNotes ||
        "Exportação administrativa executada após aprovação da empresa controladora.",
    });
    showDialog("completion");
  }, [primaryAction, showDialog]);

  const handleOpenExportDialog = useCallback(() => {
    setExportDraft(INITIAL_EXPORT);
    showDialog("export");
  }, [showDialog]);

  const handlePrimaryAction = useCallback(async () => {
    if (!primaryAction) return;
    if (actionLoading) return;

    if (primaryAction.nextStatus === "APPROVED_FOR_EXPORT") {
      setApprovalDraft({
        justification: "",
        scope: "",
        internalNotes: primaryAction.internalNotes,
      });
      showDialog("approval");
      return;
    }

    if (primaryAction.nextStatus === "COMPLETED") {
      handleOpenCompletionDialog();
      return;
    }

    await performTransition(
      {
        newStatus: primaryAction.nextStatus,
        publicNotes: primaryAction.publicNotes,
        internalNotes: primaryAction.internalNotes,
      },
      "Solicitação avançada com sucesso!"
    );
  }, [actionLoading, handleOpenCompletionDialog, performTransition, primaryAction, showDialog]);

  const handleApproveExport = useCallback(async () => {
    if (actionLoading) return;
    const errors: FieldErrors = {};
    if (!approvalDraft.justification.trim()) {
      errors.approvalJustification = "Informe a justificativa da aprovação.";
    }
    if (!approvalDraft.scope.trim()) {
      errors.approvalScope = "Informe o escopo aprovado.";
    }
    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    const transitioned = await performTransition(
      {
        newStatus: "APPROVED_FOR_EXPORT",
        publicNotes: approvalDraft.justification.trim(),
        internalNotes: [
          `Escopo aprovado: ${approvalDraft.scope.trim()}`,
          approvalDraft.internalNotes.trim()
            ? `Observações internas: ${approvalDraft.internalNotes.trim()}`
            : "Observações internas: Identidade e vínculo validados pelo administrador da empresa.",
        ].join("\n"),
      },
      "Exportação aprovada com sucesso!"
    );

    if (transitioned) {
      setApprovalDraft(INITIAL_APPROVAL);
      closeDialog();
    }
  }, [actionLoading, applyFieldErrors, approvalDraft, closeDialog, performTransition]);

  const handleCompletion = useCallback(async () => {
    if (actionLoading) return;
    const errors: FieldErrors = {};
    if (!completionDraft.publicNotes.trim()) {
      errors.completionPublicNotes = "Informe a nota pública de conclusão.";
    }
    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    const transitioned = await performTransition(
      {
        newStatus: "COMPLETED",
        publicNotes: completionDraft.publicNotes.trim(),
        internalNotes:
          completionDraft.internalNotes.trim() ||
          "Exportação administrativa executada após aprovação da empresa controladora.",
      },
      "Solicitação concluída com sucesso!"
    );

    if (transitioned) {
      setCompletionDraft(INITIAL_COMPLETION);
      closeDialog();
    }
  }, [actionLoading, applyFieldErrors, closeDialog, completionDraft, performTransition]);

  const handleReject = useCallback(async () => {
    if (actionLoading) return;
    const errors: FieldErrors = {};
    if (!rejectDraft.reason.trim()) {
      errors.rejectionReason = "Informe o motivo da rejeição.";
    }
    if (!rejectDraft.publicNote.trim()) {
      errors.rejectionPublicNote = "Informe a nota pública de rejeição.";
    }
    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    const transitioned = await performTransition(
      {
        newStatus: "REJECTED",
        closedReason: rejectDraft.reason.trim(),
        publicNotes: rejectDraft.publicNote.trim(),
        internalNotes: rejectDraft.internalNote.trim() || undefined,
      },
      "Solicitação rejeitada com sucesso!"
    );

    if (transitioned) {
      setRejectDraft(INITIAL_REJECT);
      closeDialog();
    }
  }, [actionLoading, applyFieldErrors, closeDialog, performTransition, rejectDraft]);

  const handleTransition = useCallback(async () => {
    if (actionLoading) return;
    const errors: FieldErrors = {};
    const { nextStatus, notes, rejectionReason } = transitionDraft;

    if (!nextStatus) {
      errors.transitionStatus = "Selecione a próxima etapa.";
    }
    if (nextStatus === "REJECTED" && !rejectionReason.trim()) {
      errors.rejectionReason = "Informe o motivo da rejeição.";
    }
    if (
      nextStatus &&
      (["COMPLETED", "PARTIALLY_COMPLETED"] as LgpdRequestStatus[]).includes(nextStatus) &&
      !notes.trim()
    ) {
      errors.transitionNotes = "Informe as notas de resolução.";
    }
    if (!applyFieldErrors(errors, "Preencha os campos obrigatórios antes de continuar.")) {
      return;
    }

    if (!nextStatus) return;

    const payload: LgpdRequestTransitionPayload = {
      newStatus: nextStatus,
      publicNotes: notes.trim() || undefined,
      internalNotes: undefined,
      closedReason:
        nextStatus === "REJECTED" && rejectionReason.trim()
          ? rejectionReason.trim()
          : undefined,
    };

    const transitioned = await performTransition(payload, "Solicitação avançada com sucesso!");
    if (transitioned) {
      setTransitionDraft(INITIAL_TRANSITION);
      closeDialog();
    }
  }, [actionLoading, applyFieldErrors, closeDialog, performTransition, transitionDraft]);

  const handleRequestComplement = useCallback(async () => {
    if (actionLoading) return;
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
      setComplementMessage("");
      closeDialog();
    } catch (err) {
      toast.error(getServiceErrorMessage(err, "Não foi possível solicitar complemento."));
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, applyFieldErrors, closeDialog, complementMessage, refreshRequest, requestId]);

  const handleCancel = useCallback(async () => {
    if (actionLoading) return;
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
      setCancelReason("");
      closeDialog();
    } catch (err) {
      toast.error(getServiceErrorMessage(err, "Não foi possível cancelar a solicitação."));
    } finally {
      setActionLoading(false);
    }
  }, [actionLoading, applyFieldErrors, cancelReason, closeDialog, refreshRequest, requestId]);

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    if (!requestId) {
      toast.error("ID da solicitação não disponível");
      return;
    }
    const errors: FieldErrors = {};
    if (!exportDraft.legalBasis.trim()) {
      errors.exportLegalBasis = "Informe o fundamento legal.";
    }
    if (!exportDraft.operationalReason.trim()) {
      errors.exportOperationalReason = "Informe o motivo operacional.";
    }
    if (!exportDraft.reviewerNotes.trim()) {
      errors.exportReviewerNotes = "Informe as notas do revisor.";
    }
    if (!applyFieldErrors(errors, "Revise os campos obrigatórios da exportação.")) {
      return;
    }

    setIsExporting(true);
    let downloadUrl: string | null = null;
    try {
      const exportResponse = await exportApprovedLgpdRequestData(requestId, {
        includePreciseGeolocation: exportDraft.includePreciseGeolocation,
        legalBasis: exportDraft.legalBasis.trim(),
        operationalReason: exportDraft.operationalReason.trim(),
        reviewerNotes: exportDraft.reviewerNotes.trim(),
      });

      const json = JSON.stringify(exportResponse, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `dados-solicitacao-${requestId}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Dados exportados com sucesso!");
      setHasExportedReviewedData(true);
      setExportDraft(INITIAL_EXPORT);
      closeDialog();
      await refreshRequest();
    } catch (err) {
      toast.error(getServiceErrorMessage(err, "Não foi possível exportar os dados."));
    } finally {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setIsExporting(false);
    }
  }, [applyFieldErrors, closeDialog, exportDraft, isExporting, refreshRequest, requestId]);

  const goBack = useCallback(() => {
    navigate(APP_PATHS.lgpdAdminRequests);
  }, [navigate]);

  return {
    requestId,
    request,
    loading,
    error,
    actionLoading,
    isExporting,
    hasExportedReviewedData,
    anonymizationResult,
    setAnonymizationResult,

    primaryAction,
    isExportable,
    isClosed,
    isApprovedForExport,
    canShowCancelAction,
    availableAdvancedTransitions,
    workflowSteps,

    openDialog,
    showDialog,
    closeDialog,

    approvalDraft,
    updateApprovalDraft,
    completionDraft,
    updateCompletionDraft,
    rejectDraft,
    updateRejectDraft,
    transitionDraft,
    updateTransitionDraft,
    complementMessage,
    setComplementMessage,
    cancelReason,
    setCancelReason,
    exportDraft,
    updateExportDraft,

    fieldErrors,
    clearFieldError,

    handlePrimaryAction,
    handleApproveExport,
    handleCompletion,
    handleReject,
    handleTransition,
    handleRequestComplement,
    handleCancel,
    handleExport,
    handleOpenExportDialog,
    handleOpenCompletionDialog,

    goBack,
    refreshRequest,
  };
};
