

// Interface que espelha o DTO VacationRequestResponse do Java
export interface IVacationRequestResponse {
  employeeId: string; // UUID em string
  employeeName: string;
  startDate: string; // Data no formato 'dd-MM-yyyy'
  endDate: string;   // Data no formato 'dd-MM-yyyy'
  status: 'REQUEST_VACATION' | 'VACATION' | 'VACATION_REJECTED' | string;
  // Lista de IDs dos TimeRecords para aprovação/rejeição em lote
  timeRecordIdsForApproval: number[];
}

// Parâmetros de query para a chamada de serviço de férias
export interface IVacationQueryParams {
    page: number;
    size: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL' | string;
    employeeName: string;
}

// DTO de requisição para Aprovação/Rejeição (para reuso)
export interface IVacationApprovalRequest {
  timeRecordIds: number[];
}


// DTO de requisição para POST /records/vacation-request
export interface IRequestVacationRequest {
    startDate: string; // Data no formato 'dd-MM-yyyy'
    endDate: string;   // Data no formato 'dd-MM-yyyy'
    managerId: string; // UUID do manager em string
}
// Novo tipo para a lista de managers para seleção
export interface IManagerOption {
    userId: string;
    username: string; // Usado para exibição na interface
}

export interface RequestTimeOffRequestPayload {
  startDate: string; // "dd-MM-yyyy"
  endDate: string; // "dd-MM-yyyy"
  startHour: string; // "HH:mm"
  endHour: string; // "HH:mm"
  managerId: string; // UUID string
}

export interface TimeOffFormState {
  startDate?: Date;
  endDate?: Date;
  startHour: string;
  endHour: string;
  managerId: string;
  document: File | null;
}