import { useCallback, useEffect, useMemo, useState } from "react";
import { usePendingApprovals } from "@/hooks/usePendingApproval";
import type { TimeRecordApprovalResponse } from "@/types/recordApproval";
import { isPendingClosure } from "../utils/approval-formatters";

export interface PendingApprovalsViewModel {
  currentPage: number;
  setCurrentPage: (page: number) => void;

  draftEmployeeName: string;
  setDraftEmployeeName: (value: string) => void;
  appliedEmployeeName: string;
  search: () => void;
  clearSearch: () => void;
  hasActiveFilter: boolean;

  isLoading: boolean;
  isMutating: boolean;
  hasError: boolean;
  errorMessage: string | null;

  approvals: TimeRecordApprovalResponse[];
  totalPages: number;
  totalElements: number;
  uniqueEmployees: number;

  selectedRequest: TimeRecordApprovalResponse | null;
  selectRequest: (request: TimeRecordApprovalResponse | null) => void;

  pendingClosureCount: number;
  pendingTotal: number;

  approve: (id: number) => void;
  reject: (id: number) => void;
}

const extractErrorMessage = (error: unknown): string | null => {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Não foi possível carregar as solicitações.";
};

export const usePendingApprovalsViewModel = (): PendingApprovalsViewModel => {
  const [currentPage, setCurrentPage] = useState(0);
  const [draftEmployeeName, setDraftEmployeeName] = useState("");
  const [appliedEmployeeName, setAppliedEmployeeName] = useState("");
  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  const { data, isLoading, error, approve, reject, isMutating } = usePendingApprovals({
    page: currentPage,
    employeeName: appliedEmployeeName,
  });

  const approvals = useMemo(() => data?.approvals ?? [], [data?.approvals]);
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  useEffect(() => {
    if (approvals.length === 0) {
      if (selectedKey !== null) setSelectedKey(null);
      return;
    }
    if (selectedKey === null || !approvals.some((item) => item.timeRecordId === selectedKey)) {
      setSelectedKey(approvals[0].timeRecordId);
    }
  }, [approvals, selectedKey]);

  const selectedRequest = useMemo(
    () => approvals.find((item) => item.timeRecordId === selectedKey) ?? null,
    [approvals, selectedKey]
  );

  const selectRequest = useCallback((request: TimeRecordApprovalResponse | null) => {
    setSelectedKey(request?.timeRecordId ?? null);
  }, []);

  const search = useCallback(() => {
    setCurrentPage(0);
    setAppliedEmployeeName(draftEmployeeName.trim());
  }, [draftEmployeeName]);

  const clearSearch = useCallback(() => {
    setDraftEmployeeName("");
    setAppliedEmployeeName("");
    setCurrentPage(0);
  }, []);

  const pendingClosureCount = useMemo(
    () => approvals.filter(isPendingClosure).length,
    [approvals]
  );

  const uniqueEmployees = useMemo(() => {
    const set = new Set<string>();
    approvals.forEach((item) => {
      if (item.partnerName) set.add(item.partnerName);
    });
    return set.size;
  }, [approvals]);

  return {
    currentPage,
    setCurrentPage,
    draftEmployeeName,
    setDraftEmployeeName,
    appliedEmployeeName,
    search,
    clearSearch,
    hasActiveFilter: Boolean(appliedEmployeeName) || currentPage !== 0,
    isLoading,
    isMutating,
    hasError: Boolean(error),
    errorMessage: extractErrorMessage(error),
    approvals,
    totalPages,
    totalElements,
    uniqueEmployees,
    selectedRequest,
    selectRequest,
    pendingClosureCount,
    pendingTotal: totalElements,
    approve,
    reject,
  };
};
