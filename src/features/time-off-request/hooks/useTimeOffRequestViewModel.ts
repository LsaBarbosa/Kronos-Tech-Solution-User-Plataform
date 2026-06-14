import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";
import { fetchManagerOptions, requestTimeOff } from "@/service/records.service";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { dateToBackendDatePattern } from "@/utils/date-format";
import {
  formatTimeOffFileSize,
  formatTimeOffFileTypeLabel,
  getTimeOffPeriodSummary,
} from "../utils/timeOffFormatting";
import { getTimeOffTypeOption } from "../mappers/time-off-request.mapper";
import { prepareEvidenceFile } from "../utils/timeOffEvidence";
import { validateTimeOffRequest } from "../utils/timeOffValidation";
import type { TimeOffRequestSelection, TimeOffRequestType, TimeOffRequestViewModel } from "../types";
import type { RequestTimeOffRequestPayload } from "@/types/vacation";

const DEFAULT_START_HOUR = "";
const DEFAULT_END_HOUR = "";

export const useTimeOffRequestViewModel = (): TimeOffRequestViewModel => {
  const queryClient = useQueryClient();
  const [requestType, setRequestTypeState] = useState<TimeOffRequestType | "">("");
  const [startDate, setStartDateState] = useState<Date | undefined>(undefined);
  const [endDate, setEndDateState] = useState<Date | undefined>(undefined);
  const [startHour, setStartHourState] = useState(DEFAULT_START_HOUR);
  const [endHour, setEndHourState] = useState(DEFAULT_END_HOUR);
  const [managerId, setManagerIdState] = useState("");
  const [document, setDocumentState] = useState<File | null>(null);
  const [documentErrorState, setDocumentErrorState] = useState<string | undefined>(undefined);
  const [isPreparingDocument, setIsPreparingDocument] = useState(false);
  const [successTimeRecordId, setSuccessTimeRecordId] = useState<number | undefined>(undefined);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | undefined>(undefined);

  const {
    data: managerOptions = [],
    isLoading: isLoadingManagers,
    error: managerError,
  } = useQuery({
    queryKey: queryKeys.managerOptions,
    queryFn: fetchManagerOptions,
  });

  const selectedManager = useMemo(
    () => managerOptions.find((manager) => manager.userId === managerId),
    [managerId, managerOptions]
  );

  const selectedTypeOption = useMemo(
    () => getTimeOffTypeOption(requestType),
    [requestType]
  );

  const periodSummary = useMemo(
    () => getTimeOffPeriodSummary(startDate, endDate, startHour, endHour),
    [endDate, endHour, startDate, startHour]
  );

  const baseSelection = useMemo<TimeOffRequestSelection>(
    () => ({
      requestType,
      startDate,
      endDate,
      startHour,
      endHour,
      managerId,
      document,
    }),
    [document, endDate, endHour, managerId, requestType, startDate, startHour]
  );

  const validationResult = useMemo(() => {
    const result = validateTimeOffRequest(baseSelection);
    const mergedFieldErrors = { ...result.fieldErrors };
    const mergedDocumentError = documentErrorState ?? result.fieldErrors.document;

    if (mergedDocumentError) {
      mergedFieldErrors.document = mergedDocumentError;
    }

    const mergedMessage = mergedDocumentError ?? result.message;

    return {
      ...result,
      fieldErrors: mergedFieldErrors,
      documentError: mergedDocumentError,
      message: mergedMessage,
      isValid: !mergedMessage,
    };
  }, [baseSelection, documentErrorState]);

  const managerErrorMessage = useMemo(
    () =>
      managerError
        ? getServiceErrorMessage(managerError, "Não foi possível carregar a lista de gestores.")
        : undefined,
    [managerError]
  );

  const clearSubmissionFeedback = useCallback(() => {
    setSuccessTimeRecordId(undefined);
    setSubmitErrorMessage(undefined);
  }, []);

  const setRequestType = useCallback(
    (nextType: TimeOffRequestType) => {
      clearSubmissionFeedback();
      setRequestTypeState(nextType);
    },
    [clearSubmissionFeedback]
  );

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

  const setStartHour = useCallback(
    (hour: string) => {
      clearSubmissionFeedback();
      setStartHourState(hour);
    },
    [clearSubmissionFeedback]
  );

  const setEndHour = useCallback(
    (hour: string) => {
      clearSubmissionFeedback();
      setEndHourState(hour);
    },
    [clearSubmissionFeedback]
  );

  const setManagerId = useCallback(
    (nextManagerId: string) => {
      clearSubmissionFeedback();
      setManagerIdState(nextManagerId);
    },
    [clearSubmissionFeedback]
  );

  const setDocument = useCallback(
    async (file: File | null) => {
      clearSubmissionFeedback();

      if (!file) {
        setDocumentState(null);
        setDocumentErrorState(undefined);
        return;
      }

      setIsPreparingDocument(true);

      try {
        const prepared = await prepareEvidenceFile(file);

        if (prepared.error || !prepared.file) {
          setDocumentState(null);
          setDocumentErrorState(prepared.error ?? "O arquivo enviado não é válido.");
          return;
        }

        setDocumentState(prepared.file);
        setDocumentErrorState(undefined);
      } finally {
        setIsPreparingDocument(false);
      }
    },
    [clearSubmissionFeedback]
  );

  const clearDocument = useCallback(() => {
    clearSubmissionFeedback();
    setDocumentState(null);
    setDocumentErrorState(undefined);
  }, [clearSubmissionFeedback]);

  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: (payload: { request: RequestTimeOffRequestPayload; document: File | null }) =>
      requestTimeOff(payload.request, payload.document),
    onSuccess: async (createdId) => {
      setSuccessTimeRecordId(createdId);
      setSubmitErrorMessage(undefined);
      toast.success("Solicitação enviada para análise.", {
        description: "Cada dia do período será registrado para aprovação.",
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.timeOffCount }),
        queryClient.invalidateQueries({ queryKey: queryKeys.timeOffApprovals }),
      ]);
    },
    onError: (error) => {
      const message = getAdministrativeErrorMessage(error, "timeOff");
      setSubmitErrorMessage(message);
      toast.error(message, {
        title: "Falha ao enviar",
      });
    },
  });

  const submit = useCallback(() => {
    const currentValidation = validateTimeOffRequest(baseSelection);
    const currentDocumentError = documentErrorState ?? currentValidation.fieldErrors.document;

    if (!currentValidation.isValid || currentDocumentError) {
      const message = currentDocumentError ?? currentValidation.message ?? "Revise os campos obrigatórios antes de enviar.";
      setSubmitErrorMessage(message);
      toast.error(message, {
        title: "Revise a solicitação",
      });
      return;
    }

    if (!baseSelection.requestType || !baseSelection.startDate || !baseSelection.endDate) {
      return;
    }

    mutate({
      request: {
        startDate: dateToBackendDatePattern(baseSelection.startDate),
        endDate: dateToBackendDatePattern(baseSelection.endDate),
        startHour: baseSelection.startHour,
        endHour: baseSelection.endHour,
        managerId: baseSelection.managerId,
        type: baseSelection.requestType,
      },
      document: baseSelection.document,
    });
  }, [baseSelection, documentErrorState, mutate]);

  const reset = useCallback(() => {
    setRequestTypeState("");
    setStartDateState(undefined);
    setEndDateState(undefined);
    setStartHourState(DEFAULT_START_HOUR);
    setEndHourState(DEFAULT_END_HOUR);
    setManagerIdState("");
    setDocumentState(null);
    setDocumentErrorState(undefined);
    setIsPreparingDocument(false);
    setSuccessTimeRecordId(undefined);
    setSubmitErrorMessage(undefined);
  }, []);

  const documentSummary = useMemo(() => {
    if (!document || documentErrorState) {
      return undefined;
    }

    return {
      file: document,
      name: document.name,
      typeLabel: formatTimeOffFileTypeLabel(document),
      sizeLabel: formatTimeOffFileSize(document.size),
      statusLabel: "Validado",
      isValid: true,
    };
  }, [document, documentErrorState]);

  const validationMessage = validationResult.message;

  const canSubmit =
    validationResult.isValid &&
    !isLoadingManagers &&
    !isSubmitting &&
    !isPreparingDocument &&
    !successTimeRecordId;

  return {
    requestType,
    startDate,
    endDate,
    startHour,
    endHour,
    managerId,
    document,
    managerOptions,
    selectedManager,
    isLoadingManagers,
    isSubmitting,
    isPreparingDocument,
    selectedTypeOption,
    periodSummary,
    validationResult,
    validationMessage,
    documentError: documentErrorState ?? validationResult.documentError,
    documentSummary,
    canSubmit,
    successTimeRecordId,
    submitErrorMessage,
    managerErrorMessage,
    setRequestType,
    setStartDate,
    setEndDate,
    setStartHour,
    setEndHour,
    setManagerId,
    setDocument,
    clearDocument,
    submit,
    reset,
  };
};
