import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "@/config/app-routes";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import {
  listAdminRequests,
  type LgpdRequestAdminListResponse,
  type LgpdRequestStatus,
  type LgpdRequestType,
} from "@/service/lgpd.service";

export type MobileStatusChip = "all" | "open" | "in_analysis" | "overdue";

export interface LgpdFilterState {
  type?: LgpdRequestType;
  status?: LgpdRequestStatus;
  companyId?: string;
  employeeName: string;
}

export interface LgpdAdminKpis {
  open: number;
  inAnalysis: number;
  overdue: number;
  approvedForExport: number;
}

export interface UseLgpdAdminRequestsViewModelReturn {
  requests: LgpdRequestAdminListResponse[];
  filteredRequests: LgpdRequestAdminListResponse[];
  selectedRequest: LgpdRequestAdminListResponse | null;
  setSelectedRequestId: (id: string | null) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setPage: (page: number) => void;
  filters: LgpdFilterState;
  setTypeFilter: (type: LgpdRequestType | undefined) => void;
  setStatusFilter: (status: LgpdRequestStatus | undefined) => void;
  setCompanyFilter: (companyId: string | undefined) => void;
  setEmployeeNameFilter: (name: string) => void;
  mobileStatusChip: MobileStatusChip;
  setMobileStatusChip: (chip: MobileStatusChip) => void;
  kpis: LgpdAdminKpis;
  refetch: () => Promise<void>;
  openDetails: (requestId: string) => void;
  hasActiveFilters: boolean;
}

const PAGE_SIZE = 10;

const matchesMobileChip = (
  request: LgpdRequestAdminListResponse,
  chip: MobileStatusChip
): boolean => {
  switch (chip) {
    case "open":
      return request.status === "OPEN";
    case "in_analysis":
      return request.status === "IN_ANALYSIS";
    case "overdue":
      return Boolean(request.isOverdue);
    case "all":
    default:
      return true;
  }
};

export const useLgpdAdminRequestsViewModel = (): UseLgpdAdminRequestsViewModelReturn => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LgpdRequestAdminListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<LgpdFilterState>({ employeeName: "" });
  const [selectedRequestId, setSelectedRequestIdState] = useState<string | null>(null);
  const [mobileStatusChip, setMobileStatusChip] = useState<MobileStatusChip>("all");

  const isFetchingRef = useRef(false);

  const fetchRequests = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setError(null);
    setIsLoading(true);

    try {
      const data = await listAdminRequests(
        currentPage,
        PAGE_SIZE,
        filters.type,
        filters.status,
        filters.companyId,
        filters.employeeName || undefined
      );
      const content = Array.isArray(data.content) ? data.content : [];
      setRequests(content);
      setTotalPages(typeof data.totalPages === "number" ? data.totalPages : 0);
    } catch (err) {
      setRequests([]);
      setTotalPages(0);
      setError(getServiceErrorMessage(err, "Erro ao carregar solicitações LGPD."));
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentPage, filters]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(
    () => requests.filter((request) => matchesMobileChip(request, mobileStatusChip)),
    [requests, mobileStatusChip]
  );

  useEffect(() => {
    if (filteredRequests.length === 0) {
      if (selectedRequestId !== null) {
        setSelectedRequestIdState(null);
      }
      return;
    }
    const stillInPage = selectedRequestId
      ? filteredRequests.some((request) => request.requestId === selectedRequestId)
      : false;
    if (!stillInPage) {
      setSelectedRequestIdState(filteredRequests[0].requestId);
    }
  }, [filteredRequests, selectedRequestId]);

  const selectedRequest = useMemo(
    () =>
      selectedRequestId
        ? filteredRequests.find((request) => request.requestId === selectedRequestId) ?? null
        : null,
    [filteredRequests, selectedRequestId]
  );

  const setSelectedRequestId = useCallback((id: string | null) => {
    setSelectedRequestIdState(id);
  }, []);

  const setTypeFilter = useCallback((type: LgpdRequestType | undefined) => {
    setFilters((prev) => ({ ...prev, type }));
    setCurrentPage(0);
  }, []);

  const setStatusFilter = useCallback((status: LgpdRequestStatus | undefined) => {
    setFilters((prev) => ({ ...prev, status }));
    setCurrentPage(0);
  }, []);

  const setCompanyFilter = useCallback((companyId: string | undefined) => {
    setFilters((prev) => ({ ...prev, companyId }));
    setCurrentPage(0);
  }, []);

  const setEmployeeNameFilter = useCallback((name: string) => {
    setFilters((prev) => ({ ...prev, employeeName: name }));
    setCurrentPage(0);
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage((prev) => (page === prev ? prev : Math.max(0, page)));
  }, []);

  const kpis = useMemo<LgpdAdminKpis>(() => {
    let open = 0;
    let inAnalysis = 0;
    let overdue = 0;
    let approvedForExport = 0;
    for (const request of requests) {
      if (request.status === "OPEN") open += 1;
      if (request.status === "IN_ANALYSIS") inAnalysis += 1;
      if (request.status === "APPROVED_FOR_EXPORT") approvedForExport += 1;
      if (request.isOverdue) overdue += 1;
    }
    return { open, inAnalysis, overdue, approvedForExport };
  }, [requests]);

  const openDetails = useCallback(
    (requestId: string) => {
      navigate(APP_PATHS.lgpdAdminRequestDetails.replace(":requestId", requestId));
    },
    [navigate]
  );

  const hasActiveFilters = useMemo(
    () =>
      Boolean(filters.type || filters.status || filters.companyId || filters.employeeName),
    [filters]
  );

  return {
    requests,
    filteredRequests,
    selectedRequest,
    setSelectedRequestId,
    isLoading,
    isRefreshing: false,
    error,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    setPage,
    filters,
    setTypeFilter,
    setStatusFilter,
    setCompanyFilter,
    setEmployeeNameFilter,
    mobileStatusChip,
    setMobileStatusChip,
    kpis,
    refetch: fetchRequests,
    openDetails,
    hasActiveFilters,
  };
};
