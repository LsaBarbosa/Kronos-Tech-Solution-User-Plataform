import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchVacationRequests } from "@/service/records.service";
import { useVacationApprovals } from "@/hooks/useVacationApprovals";
import { queryKeys } from "@/lib/query-keys";
import type { VacationApprovalFilter, VacationApprovalMetric, VacationApprovalViewModel } from "../types";
import { buildVacationMetric, mapVacationRequestToViewModel } from "../utils/vacation-approval-formatters";
import { useVacationApprovalResponsiveMode } from "./useVacationApprovalResponsiveMode";

const PAGE_SIZE = 6;
const METRIC_FILTERS: Array<Exclude<VacationApprovalFilter, "ALL"> | "ALL"> = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ALL",
];

export const useVacationApprovalDeskViewModel = () => {
  const isDesktop = useVacationApprovalResponsiveMode();
  const [draftEmployeeName, setDraftEmployeeName] = useState("");
  const [appliedEmployeeName, setAppliedEmployeeName] = useState("");
  const [statusFilter, setStatusFilter] = useState<VacationApprovalFilter>("PENDING");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRequestKey, setSelectedRequestKey] = useState<string | null>(null);

  const approvalsQuery = useVacationApprovals({
    page: currentPage,
    size: PAGE_SIZE,
    status: statusFilter,
    employeeName: appliedEmployeeName || undefined,
  });

  const metricQueries = useQueries({
    queries: METRIC_FILTERS.map((status) => ({
      queryKey: [...queryKeys.vacationRequests, "desk-metrics", status] as const,
      queryFn: () =>
        fetchVacationRequests({
          page: 0,
          size: 1,
          status,
        }),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    })),
  });

  const requests = useMemo<VacationApprovalViewModel[]>(
    () => approvalsQuery.requests.map(mapVacationRequestToViewModel),
    [approvalsQuery.requests]
  );

  useEffect(() => {
    if (requests.length === 0) {
      if (selectedRequestKey !== null) {
        setSelectedRequestKey(null);
      }
      return;
    }

    const selectedExists = selectedRequestKey
      ? requests.some((request) => request.key === selectedRequestKey)
      : false;

    if (!selectedExists) {
      setSelectedRequestKey(requests[0].key);
    }
  }, [requests, selectedRequestKey]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.key === selectedRequestKey) ?? requests[0] ?? null,
    [requests, selectedRequestKey]
  );

  const metricValues = useMemo(() => {
    const counts = METRIC_FILTERS.reduce<Record<string, number>>((accumulator, status, index) => {
      accumulator[status] = metricQueries[index]?.data?.totalElements ?? 0;
      return accumulator;
    }, {});

    return {
      pending: counts.PENDING ?? 0,
      approved: counts.APPROVED ?? 0,
      rejected: counts.REJECTED ?? 0,
      total: counts.ALL ?? 0,
    };
  }, [metricQueries]);

  const metrics = useMemo<VacationApprovalMetric[]>(
    () => [
      buildVacationMetric("Pendentes", metricValues.pending, "pending", "Solicitações aguardando análise"),
      buildVacationMetric("Aprovadas", metricValues.approved, "approved", "Férias efetivadas"),
      buildVacationMetric("Rejeitadas", metricValues.rejected, "rejected", "Lotes já decididos"),
      buildVacationMetric("Total", metricValues.total, "neutral", "Todas as solicitações no escopo"),
    ],
    [metricValues]
  );

  const applyStatusFilter = useCallback((nextStatus: VacationApprovalFilter) => {
    setCurrentPage(0);
    setSelectedRequestKey(null);
    setStatusFilter(nextStatus);
  }, []);

  const search = useCallback(() => {
    setAppliedEmployeeName(draftEmployeeName.trim());
    setCurrentPage(0);
    setSelectedRequestKey(null);
  }, [draftEmployeeName]);

  const clearFilters = useCallback(() => {
    setDraftEmployeeName("");
    setAppliedEmployeeName("");
    setCurrentPage(0);
    setSelectedRequestKey(null);
    setStatusFilter("PENDING");
  }, []);

  const selectRequest = useCallback((requestKey: string) => {
    setSelectedRequestKey(requestKey);
  }, []);

  const refresh = useCallback(() => {
    void approvalsQuery.refetch();
    metricQueries.forEach((query) => {
      void query.refetch();
    });
  }, [approvalsQuery, metricQueries]);

  const listError = approvalsQuery.error instanceof Error ? approvalsQuery.error : null;
  const errorMessage = listError?.message ?? "Não foi possível carregar a fila de aprovação de férias.";
  const isMetricsLoading = metricQueries.some((query) => query.isLoading);

  return {
    isDesktop,
    draftEmployeeName,
    setDraftEmployeeName,
    appliedEmployeeName,
    statusFilter,
    applyStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages: approvalsQuery.totalPages,
    totalElements: approvalsQuery.totalElements,
    requests,
    selectedRequest,
    selectRequest,
    search,
    clearFilters,
    metrics,
    isLoading: approvalsQuery.isLoading || approvalsQuery.isFetching || isMetricsLoading,
    isError: approvalsQuery.isError,
    errorMessage,
    refetch: refresh,
    isMutating: approvalsQuery.isMutating,
    approveAsync: approvalsQuery.approveAsync,
    rejectAsync: approvalsQuery.rejectAsync,
  };
};

export type VacationApprovalDeskViewModel = ReturnType<typeof useVacationApprovalDeskViewModel>;
