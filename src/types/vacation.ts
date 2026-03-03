// src/types/vacation.ts

import { StatusRecord } from './recordApproval';

export type TimeOffRequestType = 'TIME_OFF_REQUEST' | 'FORGOTTEN_REGISTRATION';

export interface RequestVacationRequest {
  startDate: string; // dd-MM-yyyy
  endDate: string; // dd-MM-yyyy
  managerId: string; // UUID
}

export interface RequestTimeOffRequestPayload {
  startDate: string; // dd-MM-yyyy
  endDate: string; // dd-MM-yyyy
  startHour: string; // HH:mm
  endHour: string; // HH:mm
  managerId: string; // UUID
  type: TimeOffRequestType;
}

export interface TimeOffFormState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startHour: string;
  endHour: string;
  managerId: string;
  document: File | null;
  requestType: TimeOffRequestType;
}

export interface VacationRequestResponse {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  status: StatusRecord;
  timeRecordIdsForApproval: number[];
}

export interface VacationApprovalRequest {
  timeRecordIds: number[];
}

export type IRequestVacationRequest = RequestVacationRequest;
export type IVacationApprovalRequest = VacationApprovalRequest;
export type IVacationRequestResponse = VacationRequestResponse;

export interface IVacationQueryParams {
  page: number;
  size: number;
  employeeName?: string;
  status?: StatusRecord | 'ALL';
}

export interface IManagerOption {
  userId: string;
  username: string;
}
