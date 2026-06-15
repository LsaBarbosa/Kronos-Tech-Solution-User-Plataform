import type { TimeRecordResponse } from "@/types/recordApproval";

export type TimeOffDecisionAction = "approve" | "reject";

export interface TimeOffApprovalViewModel {
  record: TimeRecordResponse;
  employeeName: string;
  companyName: string;
  formattedStartDate: string;
  formattedEndDate: string;
  startHour: string;
  endHour: string;
  hoursWork: string;
  documentId?: string;
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  statusKind: "pending" | "approved" | "rejected" | "other";
  statusLabel: string;
  statusTone: TimeOffStatusTone;
  kindLabel: string;
  kindKey: "time-off" | "work-time" | "update" | "other";
}

export interface TimeOffStatusTone {
  badgeClass: string;
  dotClass: string;
}
