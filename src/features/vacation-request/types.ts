import type { ManagerOption } from "@/types/vacation";

export type VacationRequestStep = "period" | "manager" | "review";

export interface VacationPeriodSummary {
  startLabel: string;
  endLabel: string;
  periodLabel: string;
  dayCount: number;
  businessDays: number;
  weekendCount: number;
  isValid: boolean;
}

export interface VacationRequestViewModel {
  startDate?: Date;
  endDate?: Date;
  managerId: string;
  managerOptions: ManagerOption[];
  selectedManager?: ManagerOption;
  isLoadingManagers: boolean;
  isSubmitting: boolean;
  dayCount: number;
  businessDays: number;
  weekendCount: number;
  periodLabel: string;
  validationMessage?: string;
  canSubmit: boolean;
  successCreatedIds?: number[];
  submitErrorMessage?: string;
  managerErrorMessage?: string;
  setStartDate: (date?: Date) => void;
  setEndDate: (date?: Date) => void;
  setManagerId: (id: string) => void;
  submit: () => void;
  reset: () => void;
}

