import type { VacationApprovalFilterStatus, VacationRequestResponse } from "@/types/vacation";

export type VacationApprovalUiStatus = "pending" | "approved" | "rejected" | "unknown";

export type VacationDecisionAction = "approve" | "reject";

export type VacationApprovalFilter = VacationApprovalFilterStatus;

export interface VacationApprovalViewModel {
  key: string;
  raw: VacationRequestResponse;
  employeeName: string;
  employeeInitials: string;
  startDateLabel: string;
  endDateLabel: string;
  periodLabel: string;
  status: VacationApprovalUiStatus;
  statusLabel: string;
  rawStatus: string;
  canDecide: boolean;
  calendarDays: number;
  businessDays: number;
  weekendDays: number;
  recordsCount: number;
}

export interface VacationApprovalMetric {
  label: string;
  value: number;
  tone: VacationApprovalUiStatus | "neutral";
  description: string;
}

export interface VacationDecisionDraft {
  action: VacationDecisionAction;
  request: VacationApprovalViewModel;
}

