export type ManualRequestType = "TIME_OFF_REQUEST" | "FORGOTTEN_REGISTRATION";
export type TimeOffRequestType = ManualRequestType;

export type VacationRequestStatus =
  | "REQUEST_VACATION"
  | "VACATION"
  | "VACATION_REJECTED";

export type VacationApprovalFilterStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ALL";

export interface VacationRequestPayload {
  startDate: string;
  endDate: string;
  managerId: string;
}

export interface ManagerOption {
  userId: string;
  username: string;
  fullName?: string;
}

export interface ManualTimeOffRequestPayload {
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
  managerId: string;
  type: ManualRequestType;
}

export interface TimeOffFormState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startHour: string;
  endHour: string;
  managerId: string;
  document: File | null;
  requestType: ManualRequestType;
}

export interface VacationRequestResponse {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  status: VacationRequestStatus | string;
  timeRecordIdsForApproval: number[];
}

export interface VacationApprovalRequest {
  timeRecordIds: number[];
}

export interface VacationQueryParams {
  page: number;
  size: number;
  status: VacationApprovalFilterStatus;
  employeeName?: string;
}

export interface VacationRequestPageResponse {
  requests: VacationRequestResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

export const EMPTY_VACATION_REQUEST_PAGE: VacationRequestPageResponse = {
  requests: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  isFirst: true,
  isLast: true,
};

export type IRequestVacationRequest = VacationRequestPayload;
export type IManagerOption = ManagerOption;
export type RequestTimeOffRequestPayload = ManualTimeOffRequestPayload;
export type IVacationQueryParams = VacationQueryParams;
export type IVacationRequestResponse = VacationRequestResponse;
export type IVacationRequestPageResponse = VacationRequestPageResponse;
export type IVacationApprovalRequest = VacationApprovalRequest;
