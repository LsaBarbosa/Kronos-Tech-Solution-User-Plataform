import type { VacationRequestResponse } from "@/types/vacation";

export type VacationDecisionAction = "approve" | "reject";

export interface VacationApprovalViewModel {
  raw: VacationRequestResponse;
  key: string;
  employeeName: string;
  employeeId: string;
  startDateLabel: string;
  endDateLabel: string;
  periodLabel: string;
  totalDays: number;
  weekendDays: number;
  recordIds: number[];
  recordsCount: number;
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  statusKind: "pending" | "approved" | "rejected" | "other";
  statusLabel: string;
  statusTone: VacationStatusTone;
}

export interface VacationStatusTone {
  badgeClass: string;
  dotClass: string;
}
