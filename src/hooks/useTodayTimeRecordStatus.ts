import { useCallback, useEffect, useRef, useState } from "react";
import { useCheckin } from "@/hooks/useCheckin";
import { fetchTodayTimeRecordStatus } from "@/service/records.service";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import type { TodayTimeRecordStatusResponse } from "@/types/today-time-record";

interface UseTodayTimeRecordStatusReturn {
  todayStatus: TodayTimeRecordStatusResponse | null;
  isLoadingToday: boolean;
  todayError: string | null;
  refreshToday: () => Promise<void>;
}

export const useTodayTimeRecordStatus = (): UseTodayTimeRecordStatusReturn => {
  const [todayStatus, setTodayStatus] = useState<TodayTimeRecordStatusResponse | null>(null);
  const [isLoadingToday, setIsLoadingToday] = useState(true);
  const [todayError, setTodayError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const lastCheckinRefreshRef = useRef<string | null>(null);
  const { state } = useCheckin();

  const loadTodayStatus = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoadingToday(true);
    }

    setTodayError(null);

    try {
      const response = await fetchTodayTimeRecordStatus();
      if (!isMountedRef.current) {
        return;
      }

      setTodayStatus({
        ...response,
        records: Array.isArray(response.records) ? response.records : [],
      });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      const normalized = normalizeServiceError(error);
      setTodayError(normalized.message || "Falha ao carregar o ponto de hoje.");
      setTodayStatus((current) =>
        current
          ? {
              ...current,
              records: Array.isArray(current.records) ? current.records : [],
            }
          : null
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoadingToday(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadTodayStatus();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadTodayStatus]);

  useEffect(() => {
    if (state.status !== "success" || !state.lastAttemptAt) {
      return;
    }

    if (lastCheckinRefreshRef.current === state.lastAttemptAt) {
      return;
    }

    lastCheckinRefreshRef.current = state.lastAttemptAt;
    void loadTodayStatus(false);
  }, [loadTodayStatus, state.lastAttemptAt, state.status]);

  return {
    todayStatus,
    isLoadingToday,
    todayError,
    refreshToday: () => loadTodayStatus(),
  };
};
