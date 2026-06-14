import { isBefore, startOfDay } from "date-fns";
import { isAllowedDocumentFile, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";
import { formatTimeOffTypeLabel } from "./timeOffFormatting";
import type { TimeOffRequestSelection, TimeOffRequestType, TimeOffRequestValidationResult } from "../types";

export const TIME_OFF_EVIDENCE_TYPE_ERROR =
  "Tipo de arquivo não permitido. Use PDF, JPG, JPEG ou PNG.";

export const TIME_OFF_EVIDENCE_SIZE_ERROR = (maxSizeBytes = MAX_UPLOAD_SIZE_BYTES) => {
  const maxSizeMB = (maxSizeBytes / 1024 / 1024).toFixed(0);
  return `Arquivo muito grande. O limite é de ${maxSizeMB}MB.`;
};

const hasValidDate = (value?: Date): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

const parseMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return Number.NaN;
  }

  return hours * 60 + minutes;
};

export const isTimeOffDateDisabled = (_date: Date) => false;

export const validateTimeOffEvidenceFile = (file: File | null): string | undefined => {
  if (!file) {
    return undefined;
  }

  if (!isAllowedDocumentFile(file)) {
    return TIME_OFF_EVIDENCE_TYPE_ERROR;
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return TIME_OFF_EVIDENCE_SIZE_ERROR();
  }

  return undefined;
};

export const validateTimeOffRequest = (selection: TimeOffRequestSelection): TimeOffRequestValidationResult => {
  const fieldErrors: TimeOffRequestValidationResult["fieldErrors"] = {};
  const documentError = validateTimeOffEvidenceFile(selection.document);

  if (!selection.requestType) {
    fieldErrors.requestType = "Selecione o tipo de solicitação.";
  }

  if (!hasValidDate(selection.startDate)) {
    fieldErrors.startDate = "A data inicial é obrigatória.";
  }

  if (!hasValidDate(selection.endDate)) {
    fieldErrors.endDate = "A data final é obrigatória.";
  }

  if (!selection.startHour.trim()) {
    fieldErrors.startHour = "A hora inicial é obrigatória.";
  }

  if (!selection.endHour.trim()) {
    fieldErrors.endHour = "A hora final é obrigatória.";
  }

  if (!selection.managerId.trim()) {
    fieldErrors.managerId = "Selecione o gestor responsável.";
  }

  if (documentError) {
    fieldErrors.document = documentError;
  }

  if (!fieldErrors.startDate && !fieldErrors.endDate && hasValidDate(selection.startDate) && hasValidDate(selection.endDate)) {
    const safeStart = startOfDay(selection.startDate);
    const safeEnd = startOfDay(selection.endDate);

    if (isBefore(safeEnd, safeStart)) {
      fieldErrors.endDate = "A data final não pode ser anterior à inicial.";
    }

    if (safeStart.getTime() === safeEnd.getTime()) {
      const startMinutes = parseMinutes(selection.startHour);
      const endMinutes = parseMinutes(selection.endHour);

      if (Number.isFinite(startMinutes) && Number.isFinite(endMinutes) && endMinutes <= startMinutes) {
        fieldErrors.endHour = "A hora final precisa ser posterior à inicial no mesmo dia.";
      }
    }
  }

  const message = Object.values(fieldErrors).find(Boolean);

  return {
    fieldErrors,
    documentError,
    message,
    isValid: !message,
  };
};

export const getTimeOffStepValidationMessage = (
  step: "type" | "period" | "manager" | "evidence" | "review",
  selection: TimeOffRequestSelection
) => {
  if (step === "type") {
    if (!selection.requestType) {
      return "Selecione o tipo da solicitação.";
    }

    return undefined;
  }

  if (step === "period") {
    const result = validateTimeOffRequest(selection);
    return result.fieldErrors.startDate || result.fieldErrors.endDate || result.fieldErrors.startHour || result.fieldErrors.endHour;
  }

  if (step === "manager") {
    if (!selection.managerId.trim()) {
      return "Selecione o gestor responsável.";
    }

    return undefined;
  }

  if (step === "evidence") {
    return validateTimeOffEvidenceFile(selection.document);
  }

  const result = validateTimeOffRequest(selection);
  return result.message;
};

export const canSubmitTimeOffRequest = (selection: TimeOffRequestSelection) =>
  validateTimeOffRequest(selection).isValid;

export const getTimeOffTypeLabel = (type: TimeOffRequestType | "") => formatTimeOffTypeLabel(type);
