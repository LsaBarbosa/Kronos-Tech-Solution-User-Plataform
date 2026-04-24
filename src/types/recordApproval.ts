// src/types/recordApproval.ts

export type StatusRecord =
  | 'CREATED'
  | 'PENDING'
  | 'UPDATED'
  | 'UPDATE_REJECTED'
  | 'DAY_OFF'
  | 'ABSENCE'
  | 'PENDING_APPROVAL'
  | 'TIME_OFF'
  | 'WORK_TIME_REQUEST'
  | 'WORK_TIME_REJECTED'
  | 'IMPLICIT_BREAK'
  | 'REQUEST_VACATION'
  | 'VACATION'
  | 'VACATION_REJECTED'
  | 'TIME_OFF_REQUEST'
  | 'TIME_OFF_REJECTED';

export interface EmployeeData {
  employeeName: string;
  companyName: string;
}

// Interface para a resposta de um TimeRecord
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

// NOVO: Interface para a resposta paginada de TimeRecords
export interface TimeRecordPageResponse {
  records: TimeRecordResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

// Interface para a requisição de alteração de ponto
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

export interface ITimeRecordApprovalResponse {
  timeRecordId: number;
  partnerName: string;
  managerUsername: string;
  newStartWork: string;
  newEndWork: string;
  currentStartWork: string;
  currentEndWork: string | null;
}

export interface ITimeRecordApprovalPageResponse {
  approvals: ITimeRecordApprovalResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

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

export interface ITimeOffQueryParams {
    page: number;
    size: number;
    employeeName?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
}
export type ITimeRecordPageResponse = TimeRecordPageResponse;
