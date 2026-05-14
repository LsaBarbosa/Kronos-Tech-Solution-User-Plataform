// src/types/recordApproval.ts

export type RecordStatus =
  | "CREATED"
  | "PENDING"
  | "UPDATED"
  | "UPDATE_REJECTED"
  | "DAY_OFF"
  | "ABSENCE"
  | "PENDING_APPROVAL"
  | "TIME_OFF"
  | "WORK_TIME_REQUEST"
  | "WORK_TIME_REJECTED"
  | "IMPLICIT_BREAK"
  | "REQUEST_VACATION"
  | "VACATION"
  | "VACATION_REJECTED"
  | "TIME_OFF_REQUEST"
  | "TIME_OFF_REJECTED";

export type StatusRecord = RecordStatus;

export type RecordApprovalFilterStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ALL";

export interface RecordEmployeeData {
  employeeName: string;
  companyName: string;
}

export interface TimeRecordResponse {
  timeRecordId: number;
  startWork: string;
  startHour: string;
  endWork: string | null;
  endHour: string;
  hoursWork: string;
  balance: string;
  statusRecord: RecordStatus;
  edited: boolean;
  active: boolean;
  employeeId: string;
  employeeData: RecordEmployeeData;
  documentId?: string | null;
  documentDownloadUrl?: string | null;
  documentDownloadPath?: string | null;
}

export interface TimeRecordPageResponse {
  records: TimeRecordResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface TimeRecordApprovalResponse {
  timeRecordId: number;
  partnerName: string;
  managerUsername: string;
  newStartWork: string;
  newEndWork: string;
  currentStartWork: string;
  currentEndWork: string | null;
  documentId?: string | null;
  documentDownloadUrl?: string | null;
  documentDownloadPath?: string | null;
}

export interface TimeRecordApprovalPageResponse {
  approvals: TimeRecordApprovalResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface PendingApprovalQueryParams {
  page: number;
  employeeName: string;
}

export interface RecordStatusUpdateRequest {
  statusRecord: RecordStatus;
}

export interface TimeOffQueryParams {
  page: number;
  size: number;
  employeeName?: string;
  status: RecordApprovalFilterStatus;
}

export interface TimeOffCreatedResponse {
  timeRecordId: number;
}

export type EmployeeData = RecordEmployeeData;
export type ITimeRecordApprovalResponse = TimeRecordApprovalResponse;
export type ITimeRecordApprovalPageResponse = TimeRecordApprovalPageResponse;
export type IPendingApprovalQueryParams = PendingApprovalQueryParams;
export type IUpdateStatusRequest = RecordStatusUpdateRequest;
export type ITimeOffQueryParams = TimeOffQueryParams;
export type ITimeRecordPageResponse = TimeRecordPageResponse;
export type ITimeOffCreatedResponse = TimeOffCreatedResponse;
