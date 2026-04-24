import { useQuery } from "@tanstack/react-query";
import * as RecordsService from "@/service/records.service";
import { TimeOffQueryParams, TimeRecordPageResponse } from "@/types/recordApproval";

export interface UseTimeOffCountReturn {
  pendingTimeOffCount: number;
  isLoadingTimeOffCount: boolean;
  refetchTimeOffCount: () => void;
}

const TIME_OFF_COUNT_QUERY_KEY = ["pendingTimeOffCount"];
const EMPTY_TIME_OFF_PAGE: TimeRecordPageResponse = {
  records: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  isFirst: true,
  isLast: true,
};

export const useTimeOffCount = (): UseTimeOffCountReturn => {
  const query = useQuery<TimeRecordPageResponse, Error, number>({
    queryKey: TIME_OFF_COUNT_QUERY_KEY,
    queryFn: () =>
      RecordsService.listTimeOffRequests({
        page: 0,
        size: 1,
        employeeName: "",
        status: "PENDING" as TimeOffQueryParams["status"],
      }),
    select: (data) => data.totalElements ?? 0,
    placeholderData: EMPTY_TIME_OFF_PAGE,
    refetchInterval: 60000 * 5,
    staleTime: 60000 * 2,
  });

  return {
    pendingTimeOffCount: query.data ?? 0,
    isLoadingTimeOffCount: query.isLoading,
    refetchTimeOffCount: () => void query.refetch(),
  };
};
