// src/types/vacation.ts

import { StatusRecord } from "./recordApproval";

export interface RequestVacationRequest {
    startDate: string; // dd-MM-yyyy
    endDate: string;   // dd-MM-yyyy
    managerId: string; // UUID
}

// ATUALIZADO: Adicionado requestType opcional
export interface RequestTimeOffRequestPayload {
    startDate: string; // dd-MM-yyyy
    endDate: string;   // dd-MM-yyyy
    startHour: string; // HH:mm
    endHour: string;   // HH:mm
    managerId: string; // UUID
    requestType?: StatusRecord; // 'TIME_OFF_REQUEST' | 'FORGOTTEN_REGISTRATION'
}

export interface VacationRequestResponse {
    employeeId: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    status: string; // REQUEST_VACATION, VACATION, VACATION_REJECTED
    timeRecordIdsForApproval: number[];
}

export interface VacationApprovalRequest {
    timeRecordIds: number[];
}

// ATUALIZADO: Adicionado requestType ao estado do formulário
export interface TimeOffFormState {
    startDate: Date | undefined;
    endDate: Date | undefined;
    startHour: string;
    endHour: string;
    managerId: string;
    document: File | null;
    requestType: 'TIME_OFF_REQUEST' | 'FORGOTTEN_REGISTRATION'; // Default
}