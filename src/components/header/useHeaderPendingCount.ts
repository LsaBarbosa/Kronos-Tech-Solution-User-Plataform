import { useEffect, useState } from "react";
import * as DashboardService from "@/service/dashboard.service";
import * as RecordsService from "@/service/records.service";
import { hasApprovalPermission } from "@/types/dashboard";

interface UseHeaderPendingCountResult {
  totalPending: number;
  isLoading: boolean;
  hasError: boolean;
  canApprove: boolean;
}

const tryAccess = <T,>(getter: () => T): T | undefined => {
  try {
    return getter();
  } catch {
    return undefined;
  }
};

const safeInvoke = <T,>(fn: (() => Promise<T>) | undefined | null): Promise<T | null> => {
  if (typeof fn !== "function") return Promise.resolve(null);
  try {
    return Promise.resolve(fn()).then(
      (value) => value ?? null,
      () => null
    );
  } catch {
    return Promise.resolve(null);
  }
};

export const useHeaderPendingCount = (
  role: string | null | undefined,
  isAuthenticated: boolean
): UseHeaderPendingCountResult => {
  const canApprove = hasApprovalPermission(role ?? "");
  const enabled = isAuthenticated && canApprove;

  const [approvalsCount, setApprovalsCount] = useState(0);
  const [vacationCount, setVacationCount] = useState(0);
  const [timeOffCount, setTimeOffCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setApprovalsCount(0);
      setVacationCount(0);
      setTimeOffCount(0);
      setHasError(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    let encounteredError = false;

    const fetchApprovalsFn = tryAccess(() => DashboardService.fetchPendingApprovalsCount);
    const fetchVacationFn = tryAccess(() => RecordsService.fetchPendingVacationCount);
    const listTimeOffRequestsFn = tryAccess(() => RecordsService.listTimeOffRequests);

    const approvalsPromise = safeInvoke(fetchApprovalsFn).then((response) => {
      if (cancelled) return;
      if (!response) {
        encounteredError = true;
        return;
      }
      setApprovalsCount(response.totalElements ?? 0);
    });

    const vacationPromise = safeInvoke(fetchVacationFn).then((count) => {
      if (cancelled) return;
      if (count === null) {
        encounteredError = true;
        return;
      }
      setVacationCount(typeof count === "number" ? count : 0);
    });

    const timeOffPromise = safeInvoke(
      typeof listTimeOffRequestsFn === "function"
        ? () =>
            listTimeOffRequestsFn({ page: 0, size: 1, employeeName: "", status: "PENDING" })
        : undefined
    ).then((response) => {
      if (cancelled) return;
      if (!response) {
        encounteredError = true;
        return;
      }
      setTimeOffCount(response.totalElements ?? 0);
    });

    Promise.allSettled([approvalsPromise, vacationPromise, timeOffPromise]).then(() => {
      if (cancelled) return;
      setIsLoading(false);
      if (encounteredError) setHasError(true);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return {
    totalPending: approvalsCount + vacationCount + timeOffCount,
    isLoading,
    hasError,
    canApprove,
  };
};
