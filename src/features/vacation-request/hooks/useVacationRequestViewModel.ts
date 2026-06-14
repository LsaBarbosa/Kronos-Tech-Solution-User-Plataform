import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { fetchManagerOptions, requestVacation } from "@/service/records.service";
import { dateToBackendDatePattern } from "@/utils/date-format";
import type { VacationRequestViewModel } from "../types";
import { getVacationPeriodSummary } from "../utils/vacation-date-utils";
import { canSubmitVacationRequest, getVacationValidationMessage } from "../utils/vacation-validation";

export const useVacationRequestViewModel = (): VacationRequestViewModel => {
  const queryClient = useQueryClient();
  const [startDate, setStartDateState] = useState<Date | undefined>(undefined);
  const [endDate, setEndDateState] = useState<Date | undefined>(undefined);
  const [managerId, setManagerIdState] = useState("");
  const [successCreatedIds, setSuccessCreatedIds] = useState<number[] | undefined>(undefined);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | undefined>(undefined);

  const {
    data: managerOptions = [],
    isLoading: isLoadingManagers,
    error: managerError,
  } = useQuery({
    queryKey: queryKeys.managerOptions,
    queryFn: fetchManagerOptions,
  });

  const periodSummary = useMemo(
    () => getVacationPeriodSummary(startDate, endDate),
    [endDate, startDate]
  );

  const validationMessage = useMemo(
    () => getVacationValidationMessage({ startDate, endDate, managerId }),
    [endDate, managerId, startDate]
  );

  const selectedManager = useMemo(
    () => managerOptions.find((manager) => manager.userId === managerId),
    [managerId, managerOptions]
  );

  const clearSubmissionFeedback = useCallback(() => {
    setSuccessCreatedIds(undefined);
    setSubmitErrorMessage(undefined);
  }, []);

  const setStartDate = useCallback(
    (date?: Date) => {
      clearSubmissionFeedback();
      setStartDateState(date);
    },
    [clearSubmissionFeedback]
  );

  const setEndDate = useCallback(
    (date?: Date) => {
      clearSubmissionFeedback();
      setEndDateState(date);
    },
    [clearSubmissionFeedback]
  );

  const setManagerId = useCallback(
    (id: string) => {
      clearSubmissionFeedback();
      setManagerIdState(id);
    },
    [clearSubmissionFeedback]
  );

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (payload: { startDate: string; endDate: string; managerId: string }) =>
      requestVacation(payload),
    onSuccess: async (createdIds) => {
      setSuccessCreatedIds(createdIds);
      setSubmitErrorMessage(undefined);
      toast.success("Solicitação enviada para análise.", {
        description: `${createdIds.length} dias registrados para aprovação.`,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.vacationCount }),
        queryClient.invalidateQueries({ queryKey: queryKeys.vacationRequests }),
      ]);
    },
    onError: (error) => {
      const message = getAdministrativeErrorMessage(error, "vacation");
      setSubmitErrorMessage(message);
      toast.error(message);
    },
  });

  const submit = useCallback(() => {
    const currentValidationMessage = getVacationValidationMessage({ startDate, endDate, managerId });

    if (currentValidationMessage) {
      setSubmitErrorMessage(currentValidationMessage);
      toast.error(currentValidationMessage);
      return;
    }

    if (!startDate || !endDate) {
      return;
    }

    mutate({
      startDate: dateToBackendDatePattern(startDate),
      endDate: dateToBackendDatePattern(endDate),
      managerId,
    });
  }, [endDate, managerId, mutate, startDate]);

  const reset = useCallback(() => {
    setStartDateState(undefined);
    setEndDateState(undefined);
    setManagerIdState("");
    setSuccessCreatedIds(undefined);
    setSubmitErrorMessage(undefined);
  }, []);

  const canSubmit = useMemo(
    () => canSubmitVacationRequest({ startDate, endDate, managerId }) && !isSubmitting,
    [endDate, isSubmitting, managerId, startDate]
  );

  return {
    startDate,
    endDate,
    managerId,
    managerOptions,
    selectedManager,
    isLoadingManagers,
    isSubmitting,
    dayCount: periodSummary.dayCount,
    businessDays: periodSummary.businessDays,
    weekendCount: periodSummary.weekendCount,
    periodLabel: periodSummary.periodLabel,
    validationMessage,
    canSubmit,
    successCreatedIds,
    submitErrorMessage,
    managerErrorMessage: managerError ? getServiceErrorMessage(managerError, "Não foi possível carregar a lista de gestores.") : undefined,
    setStartDate,
    setEndDate,
    setManagerId,
    submit,
    reset,
  };
};

