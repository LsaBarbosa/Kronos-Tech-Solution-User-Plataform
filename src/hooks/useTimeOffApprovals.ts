import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as RecordsService from "@/service/records.service";
import type { TimeOffQueryParams, TimeRecordPageResponse } from "@/types/recordApproval";
import { useToast } from "@/hooks/use-toast";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import { queryKeys } from "@/lib/query-keys";

export interface UseTimeOffApprovalsReturn {
  approvalsData: TimeRecordPageResponse | null;
  isLoading: boolean;
  isMutating: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  employeeNameFilter: string;
  setEmployeeNameFilter: (name: string) => void;
  statusFilter: TimeOffQueryParams["status"];
  setStatusFilter: (status: TimeOffQueryParams["status"]) => void;
  handleSearch: () => void;
  handleAction: (timeRecordId: number, action: "approve" | "reject") => Promise<void>;
  refetch: () => void;
  sidebarOpen: boolean;
  handleToggleSidebar: () => void;
}

const ROWS_PER_PAGE = 5;
const INITIAL_STATUS_FILTER: TimeOffQueryParams["status"] = "PENDING";

export const useTimeOffApprovals = (): UseTimeOffApprovalsReturn => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [employeeNameFilter, setEmployeeNameFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TimeOffQueryParams["status"]>(INITIAL_STATUS_FILTER);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const queryKey = useMemo(
    () => [...queryKeys.timeOffApprovals, currentPage, searchQuery, statusFilter],
    [currentPage, searchQuery, statusFilter]
  );

  const approvalsQuery = useQuery({
    queryKey,
    queryFn: () =>
      RecordsService.listTimeOffRequests({
        page: currentPage,
        size: ROWS_PER_PAGE,
        employeeName: searchQuery,
        status: statusFilter,
      }),
  });

  const mutation = useMutation({
    mutationFn: async ({ timeRecordId, action }: { timeRecordId: number; action: "approve" | "reject" }) => {
      return action === "approve"
        ? RecordsService.approveTimeOff(timeRecordId)
        : RecordsService.rejectTimeOff(timeRecordId);
    },
    onSuccess: async (_, variables) => {
      toast({
        title: "Sucesso",
        description:
          variables.action === "approve"
            ? "Solicitação aprovada com sucesso!"
            : "Solicitação rejeitada com sucesso!",
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.timeOffApprovals });
    },
    onError: (error, variables) => {
      console.error(`Erro ao ${variables.action} abono:`, error);
      toast({
        title: "Erro",
        description: `Não foi possível ${variables.action} o abono. Detalhes: ${getAdministrativeErrorMessage(
          error,
          "timeOff"
        )}`,
        variant: "destructive",
      });
    },
  });

  const handleAction = useCallback(
    async (timeRecordId: number, action: "approve" | "reject") => {
      await mutation.mutateAsync({ timeRecordId, action });
    },
    [mutation]
  );

  const handleSearch = useCallback(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
      return;
    }
    setSearchQuery(employeeNameFilter);
  }, [currentPage, employeeNameFilter]);

  const refetch = useCallback(() => {
    void approvalsQuery.refetch();
  }, [approvalsQuery]);

  return {
    approvalsData: approvalsQuery.data ?? null,
    isLoading: approvalsQuery.isLoading,
    isMutating: mutation.isPending,
    currentPage,
    setCurrentPage,
    employeeNameFilter,
    setEmployeeNameFilter,
    statusFilter,
    setStatusFilter,
    handleSearch,
    handleAction,
    refetch,
    sidebarOpen,
    handleToggleSidebar,
  };
};
