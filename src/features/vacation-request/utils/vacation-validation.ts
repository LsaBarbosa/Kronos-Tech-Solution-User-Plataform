import { isBefore, startOfDay } from "date-fns";
import { isVacationDateDisabled } from "./vacation-date-utils";

export interface VacationSelectionValues {
  startDate?: Date;
  endDate?: Date;
  managerId: string;
}

const hasValidDate = (value?: Date): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

export const getVacationValidationMessage = ({
  startDate,
  endDate,
  managerId,
}: VacationSelectionValues): string | undefined => {
  if (!hasValidDate(startDate) && !hasValidDate(endDate)) {
    return "Selecione o período solicitado.";
  }

  if (!hasValidDate(startDate)) {
    return "Selecione a data inicial.";
  }

  if (!hasValidDate(endDate)) {
    return "Selecione a data final.";
  }

  const safeStart = startOfDay(startDate);
  const safeEnd = startOfDay(endDate);
  const today = startOfDay(new Date());

  if (isBefore(safeStart, today) || isBefore(safeEnd, today) || isVacationDateDisabled(startDate) || isVacationDateDisabled(endDate)) {
    return "O período precisa ser atual ou futuro.";
  }

  if (isBefore(safeEnd, safeStart)) {
    return "A data final não pode ser anterior à inicial.";
  }

  if (!managerId.trim()) {
    return "Selecione o manager responsável pela aprovação.";
  }

  return undefined;
};

export const canSubmitVacationRequest = (selection: VacationSelectionValues) =>
  !getVacationValidationMessage(selection);

