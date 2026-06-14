import type { ManagerOption, TimeOffRequestType } from "@/types/vacation";

export type { TimeOffRequestType };

export type TimeOffRequestStep = "type" | "period" | "manager" | "evidence" | "review";

export interface TimeOffTypeOption {
  value: TimeOffRequestType;
  label: string;
  description: string;
}

export interface TimeOffRequestSelection {
  requestType: TimeOffRequestType | "";
  startDate?: Date;
  endDate?: Date;
  startHour: string;
  endHour: string;
  managerId: string;
  document: File | null;
}

export interface TimeOffRequestFileSummary {
  file: File;
  name: string;
  typeLabel: string;
  sizeLabel: string;
  statusLabel: string;
  isValid: boolean;
}

export interface TimeOffRequestValidationResult {
  fieldErrors: Partial<Record<keyof TimeOffRequestSelection, string>>;
  documentError?: string;
  message?: string;
  isValid: boolean;
}

export interface TimeOffRequestPeriodSummary {
  startLabel: string;
  endLabel: string;
  periodLabel: string;
  timeLabel: string;
  dayCount: number;
  totalMinutes: number;
  hasSameDay: boolean;
  isValid: boolean;
}

export interface TimeOffRequestViewModel {
  requestType: TimeOffRequestType | "";
  startDate?: Date;
  endDate?: Date;
  startHour: string;
  endHour: string;
  managerId: string;
  document: File | null;
  managerOptions: ManagerOption[];
  selectedManager?: ManagerOption;
  isLoadingManagers: boolean;
  isSubmitting: boolean;
  isPreparingDocument: boolean;
  selectedTypeOption?: TimeOffTypeOption;
  periodSummary: TimeOffRequestPeriodSummary;
  validationResult: TimeOffRequestValidationResult;
  validationMessage?: string;
  documentError?: string;
  documentSummary?: TimeOffRequestFileSummary;
  canSubmit: boolean;
  successTimeRecordId?: number;
  submitErrorMessage?: string;
  managerErrorMessage?: string;
  setRequestType: (requestType: TimeOffRequestType) => void;
  setStartDate: (date?: Date) => void;
  setEndDate: (date?: Date) => void;
  setStartHour: (hour: string) => void;
  setEndHour: (hour: string) => void;
  setManagerId: (managerId: string) => void;
  setDocument: (file: File | null) => Promise<void>;
  clearDocument: () => void;
  submit: () => void;
  reset: () => void;
}
