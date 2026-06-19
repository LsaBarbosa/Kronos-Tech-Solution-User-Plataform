import { useCallback, useEffect, useMemo, useState } from "react";
import { useTimeOffApprovals } from "@/hooks/useTimeOffApprovals";
import { downloadDocument } from "@/service/document.service";
import { showErrorToast, showSuccessToast } from "@/lib/feedback";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import { buildApprovalViewModel } from "../utils/timeOffApprovalFormatters";
import type { TimeOffApprovalViewModel, TimeOffDecisionAction } from "../types";
import { safeLogger } from "@/utils/security/safeLogger";

export interface TimeOffApprovalsViewModel {
  sidebarOpen: boolean;
  handleToggleSidebar: () => void;

  draftEmployeeName: string;
  setDraftEmployeeName: (value: string) => void;
  statusFilter: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  setStatusFilter: (value: "PENDING" | "APPROVED" | "REJECTED" | "ALL") => void;
  applyStatusFilter: (value: "PENDING" | "APPROVED" | "REJECTED" | "ALL") => void;
  search: () => void;
  clearFilters: () => void;

  isLoading: boolean;
  isMutating: boolean;

  requests: TimeOffApprovalViewModel[];
  selectedRequest: TimeOffApprovalViewModel | null;
  selectRequest: (request: TimeOffApprovalViewModel | null) => void;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  setCurrentPage: (page: number) => void;

  metrics: {
    pending: number;
    approved: number;
    rejected: number;
    withEvidence: number;
    visible: number;
  };

  decisionTarget: TimeOffApprovalViewModel | null;
  decisionAction: TimeOffDecisionAction | null;
  openDecision: (action: TimeOffDecisionAction, request: TimeOffApprovalViewModel) => void;
  cancelDecision: () => void;
  confirmDecision: () => Promise<void>;

  handleDownload: (request: TimeOffApprovalViewModel) => Promise<void>;
}

export const useTimeOffApprovalViewModel = (): TimeOffApprovalsViewModel => {
  const base = useTimeOffApprovals();

  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<TimeOffApprovalViewModel | null>(null);
  const [decisionAction, setDecisionAction] = useState<TimeOffDecisionAction | null>(null);

  const requests = useMemo<TimeOffApprovalViewModel[]>(
    () => (base.approvalsData?.records ?? []).map(buildApprovalViewModel),
    [base.approvalsData?.records]
  );

  const totalPages = base.approvalsData?.totalPages ?? 0;
  const totalElements = base.approvalsData?.totalElements ?? 0;

  useEffect(() => {
    if (requests.length === 0) {
      if (selectedKey !== null) setSelectedKey(null);
      return;
    }

    if (selectedKey === null || !requests.some((item) => item.record.timeRecordId === selectedKey)) {
      setSelectedKey(requests[0].record.timeRecordId);
    }
  }, [requests, selectedKey]);

  const selectedRequest = useMemo(
    () => requests.find((item) => item.record.timeRecordId === selectedKey) ?? null,
    [requests, selectedKey]
  );

  const selectRequest = useCallback((request: TimeOffApprovalViewModel | null) => {
    setSelectedKey(request?.record.timeRecordId ?? null);
  }, []);

  const applyStatusFilter = useCallback(
    (value: "PENDING" | "APPROVED" | "REJECTED" | "ALL") => {
      base.setStatusFilter(value);
      base.setCurrentPage(0);
    },
    [base]
  );

  const clearFilters = useCallback(() => {
    base.setEmployeeNameFilter("");
    base.setStatusFilter("PENDING");
    base.setCurrentPage(0);
    base.handleSearch();
  }, [base]);

  const search = useCallback(() => {
    base.handleSearch();
  }, [base]);

  const openDecision = useCallback(
    (action: TimeOffDecisionAction, request: TimeOffApprovalViewModel) => {
      setDecisionAction(action);
      setDecisionTarget(request);
    },
    []
  );

  const cancelDecision = useCallback(() => {
    if (base.isMutating) return;
    setDecisionAction(null);
    setDecisionTarget(null);
  }, [base.isMutating]);

  const confirmDecision = useCallback(async () => {
    if (!decisionTarget || !decisionAction) return;
    try {
      await base.handleAction(decisionTarget.record.timeRecordId, decisionAction);
      setDecisionAction(null);
      setDecisionTarget(null);
    } catch {
      // toast already shown by mutation
    }
  }, [base, decisionAction, decisionTarget]);

  const handleDownload = useCallback(
    async (request: TimeOffApprovalViewModel) => {
      if (!request.documentId) {
        showErrorToast("Sem evidência", "Esta solicitação não possui anexo para download.");
        return;
      }
      try {
        await downloadDocument(
          request.documentId,
          `justificativa_abono_${request.record.employeeId}.pdf`,
          request.record.employeeId
        );
        showSuccessToast("Download iniciado", `Evidência de ${request.employeeName} em download.`);
      } catch (error) {
        safeLogger.error("Erro ao iniciar o download:", error);
        showErrorToast("Erro no download", getAdministrativeErrorMessage(error, "document"));
      }
    },
    []
  );

  const metrics = useMemo(
    () => ({
      pending: requests.filter((item) => item.isPending).length,
      approved: requests.filter((item) => item.isApproved).length,
      rejected: requests.filter((item) => item.isRejected).length,
      withEvidence: requests.filter((item) => Boolean(item.documentId)).length,
      visible: requests.length,
    }),
    [requests]
  );

  return {
    sidebarOpen: base.sidebarOpen,
    handleToggleSidebar: base.handleToggleSidebar,

    draftEmployeeName: base.employeeNameFilter,
    setDraftEmployeeName: base.setEmployeeNameFilter,
    statusFilter: base.statusFilter,
    setStatusFilter: base.setStatusFilter,
    applyStatusFilter,
    search,
    clearFilters,

    isLoading: base.isLoading,
    isMutating: base.isMutating,

    requests,
    selectedRequest,
    selectRequest,
    currentPage: base.currentPage,
    totalPages,
    totalElements,
    setCurrentPage: base.setCurrentPage,

    metrics,

    decisionTarget,
    decisionAction,
    openDecision,
    cancelDecision,
    confirmDecision,

    handleDownload,
  };
};
