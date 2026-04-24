export type TimeOffRequestType = "TIME_OFF_REQUEST" | "FORGOTTEN_REGISTRATION";

export interface IRequestVacationRequest {
    startDate: string;
    endDate: string;
    managerId: string;
}

export interface IManagerOption {
    userId: string;
    username: string;
}

export interface RequestTimeOffRequestPayload {
    startDate: string;
    endDate: string;
    startHour: string;
    endHour: string;
    managerId: string;
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
    status: string;
    timeRecordIdsForApproval: number[];
}

export interface VacationApprovalRequest {
    timeRecordIds: number[];
}

export interface IVacationQueryParams {
    page: number;
    size: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "ALL";
    employeeName?: string;
}

export type IVacationRequestResponse = VacationRequestResponse;

export interface IVacationRequestPageResponse {
    requests?: IVacationRequestResponse[];
    vacationRequests?: IVacationRequestResponse[];
    content?: IVacationRequestResponse[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    isFirst: boolean;
    isLast: boolean;
}

export type IVacationApprovalRequest = VacationApprovalRequest;
