import { useCallback, useEffect, useMemo, useState } from "react";
import { useVacationApprovals } from "@/hooks/useVacationApprovals";
import type {
  VacationApprovalFilterStatus,
  VacationQueryParams,
} from "@/types/vacation";
import { buildVacationViewModel } from "../utils/vacationApprovalFormatters";
import type { VacationApprovalViewModel, VacationDecisionAction } from "../types";

const PAGE_SIZE = 5;

export interface VacationApprovalsViewModel {
  draftEmployeeName: string;
  setDraftEmployeeName: (value: string) => void;
  appliedEmployeeName: string;
  statusFilter: VacationApprovalFilterStatus;
  setStatusFilter: (value: VacationApprovalFilterStatus) => void;
  applyStatusFilter: (value: VacationApprovalFilterStatus) => void;
  search: () => void;
  clearFilters: () => void;

  isLoading: boolean;
  isFetching: boolean;
  isMutating: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;

  requests: VacationApprovalViewModel[];
  selectedRequest: VacationApprovalViewModel | null;
  selectRequest: (request: VacationApprovalViewModel | null) => void;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  setCurrentPage: (page: number) => void;

  metrics: {
    pending: number;
    approved: number;
    rejected: number;
    totalDays: number;
  };

  decisionTarget: VacationApprovalViewModel | null;
  decisionAction: VacationDecisionAction | null;
  openDecision: (action: VacationDecisionAction, request: VacationApprovalViewModel) => void;
  cancelDecision: () => void;
  confirmDecision: () => Promise<void>;
}

const extractErrorMessage = (error: unknown): string | null => {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Não foi possível carregar as solicitações.";
};

export const useVacationApprovalViewModel = (): VacationApprovalsViewModel => {
  const [draftEmployeeName, setDraftEmployeeName] = useState("");
  const [appliedEmployeeName, setAppliedEmployeeName] = useState("");
  const [statusFilter, setStatusFilter] = useState<VacationApprovalFilterStatus>("PENDING");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [decisionTarget, setDecisionTarget] = useState<VacationApprovalViewModel | null>(null);
  const [decisionAction, setDecisionAction] = useState<VacationDecisionAction | null>(null);

  const params: VacationQueryParams = useMemo(
    () => ({
      page: currentPage,
      size: PAGE_SIZE,
      status: statusFilter,
      employeeName: appliedEmployeeName || undefined,
    }),
    [appliedEmployeeName, currentPage, statusFilter]
  );

  const base = useVacationApprovals(params);

  const requests = useMemo<VacationApprovalViewModel[]>(
    () => base.requests.map(buildVacationViewModel),
    [base.requests]
  );

  useEffect(() => {
    if (requests.length === 0) {
      if (selectedKey !== null) setSelectedKey(null);
      return;
    }
    if (selectedKey === null || !requests.some((item) => item.key === selectedKey)) {
      setSelectedKey(requests[0].key);
    }
  }, [requests, selectedKey]);

  const selectedRequest = useMemo(
    () => requests.find((item) => item.key === selectedKey) ?? null,
    [requests, selectedKey]
  );

  const selectRequest = useCallback((request: VacationApprovalViewModel | null) => {
    setSelectedKey(request?.key ?? null);
  }, []);

  const applyStatusFilter = useCallback((value: VacationApprovalFilterStatus) => {
    setStatusFilter(value);
    setCurrentPage(0);
  }, []);

  const search = useCallback(() => {
    setAppliedEmployeeName(draftEmployeeName.trim());
    setCurrentPage(0);
  }, [draftEmployeeName]);

  const clearFilters = useCallback(() => {
    setDraftEmployeeName("");
    setAppliedEmployeeName("");
    setStatusFilter("PENDING");
    setCurrentPage(0);
  }, []);

  const openDecision = useCallback(
    (action: VacationDecisionAction, request: VacationApprovalViewModel) => {
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
    const ids = decisionTarget.recordIds;
    if (ids.length === 0) {
      setDecisionAction(null);
      setDecisionTarget(null);
      return;
    }
    try {
      if (decisionAction === "approve") {
        await base.approveAsync(ids);
      } else {
        await base.rejectAsync(ids);
      }
      setDecisionAction(null);
      setDecisionTarget(null);
    } catch {
      // toast handled by base hook
    }
  }, [base, decisionAction, decisionTarget]);

  const metrics = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalDays = 0;
    for (const item of requests) {
      totalDays += item.totalDays;
      if (item.isPending) pending++;
      else if (item.isApproved) approved++;
      else if (item.isRejected) rejected++;
    }
    return { pending, approved, rejected, totalDays };
  }, [requests]);

  return {
    draftEmployeeName,
    setDraftEmployeeName,
    appliedEmployeeName,
    statusFilter,
    setStatusFilter,
    applyStatusFilter,
    search,
    clearFilters,
    isLoading: base.isLoading,
    isFetching: base.isFetching,
    isMutating: base.isMutating,
    isError: base.isError,
    errorMessage: extractErrorMessage(base.error),
    refetch: () => base.refetch(),
    requests,
    selectedRequest,
    selectRequest,
    currentPage,
    totalPages: base.totalPages,
    totalElements: base.totalElements,
    setCurrentPage,
    metrics,
    decisionTarget,
    decisionAction,
    openDecision,
    cancelDecision,
    confirmDecision,
  };
};
