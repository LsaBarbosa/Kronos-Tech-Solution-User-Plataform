// src/types/recordApproval.ts

export const RECORD_STATUS = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  UPDATED: 'UPDATED',
  UPDATE_REJECTED: 'UPDATE_REJECTED',
  DAY_OFF: 'DAY_OFF',
  ABSENCE: 'ABSENCE',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  TIME_OFF: 'TIME_OFF',
  WORK_TIME_REQUEST: 'WORK_TIME_REQUEST',
  IMPLICIT_BREAK: 'IMPLICIT_BREAK',
  REQUEST_VACATION: 'REQUEST_VACATION',
  VACATION: 'VACATION',
  VACATION_REJECTED: 'VACATION_REJECTED',
  TIME_OFF_REQUEST: 'TIME_OFF_REQUEST',
  TIME_OFF_REJECTED: 'TIME_OFF_REJECTED',
  FORGOTTEN_REGISTRATION: 'FORGOTTEN_REGISTRATION',
} as const;

export type StatusRecord = (typeof RECORD_STATUS)[keyof typeof RECORD_STATUS];

export interface EmployeeData {
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
  statusRecord: StatusRecord;
  edited: boolean;
  active: boolean;
  employeeId: string;
  employeeData: EmployeeData;
  documentDownloadPath?: string;
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
  documentDownloadPath?: string;
}

export interface TimeRecordApprovalPageResponse {
  approvals: TimeRecordApprovalResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

export type ITimeRecordApprovalResponse = TimeRecordApprovalResponse;
export type ITimeRecordApprovalPageResponse = TimeRecordApprovalPageResponse;

export interface IPendingApprovalQueryParams {
  page: number;
  employeeName: string;
}

export interface IUpdateStatusRequest {
  statusRecord: StatusRecord;
}

export interface IRequestTimeOffData {
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
  managerId: string;
}

export type TimeOffApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

export interface ITimeOffQueryParams {
  page: number;
  size: number;
  employeeName?: string;
  status: TimeOffApprovalStatus;
}

export type ITimeRecordPageResponse = TimeRecordPageResponse;
