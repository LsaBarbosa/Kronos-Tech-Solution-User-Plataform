// Tipos de Status que são usados para relatórios e exibição
export type StatusRecord =
  | 'CREATED'
  | 'PENDING'
  | 'UPDATED'
  | 'UPDATE_REJECTED'
  | 'DAY_OFF'
  | 'ABSENCE'
  | 'PENDING_APPROVAL'
  | 'DOCTOR_APPOINTMENT'
  | 'IMPLICIT_BREAK'
  | 'REQUEST_VACATION'
  | 'VACATION'
  | 'VACATION_REJECTED'
  | 'TIME_OFF_REQUEST' // NOVO: Abono Solicitado
  | 'TIME_OFF'         // NOVO: Abono Aprovado
  | 'TIME_OFF_REJECTED'; // NOVO: Abono Rejeitado


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
  documentDownloadPath?: string; // Adicionado para compatibilidade futura com aprovações
}

// NOVO: Interface para a resposta paginada de TimeRecords (usado no listTimeOffRequests)
export interface TimeRecordPageResponse {
  records: TimeRecordResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

// Interface para a requisição de alteração de ponto (usado no usePendingApproval)
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
  newStartWork: string; // LocalDateTime
  newEndWork: string; // LocalDateTime
  currentStartWork: string; // LocalDateTime
  currentEndWork: string | null; // LocalDateTime
}

// Tipo para a resposta paginada do backend
export interface ITimeRecordApprovalPageResponse {
  approvals: ITimeRecordApprovalResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
}

// Parâmetros de query para a chamada de serviço
export interface IPendingApprovalQueryParams {
  page: number;
  employeeName: string; // Pode ser string vazia se não houver filtro
}

// Outros tipos se existirem...
export interface IUpdateStatusRequest {
  statusRecord: string;
}

export interface IRequestTimeOffData {
    startDate: string;
    endDate: string;
    startHour: string;
    endHour: string;
    managerId: string;
}

/**
 * [NOVO] Interface para os parâmetros de query da listagem GET /records/time-off-requests
 */
export interface ITimeOffQueryParams {
    page: number;
    size: number;
    employeeName?: string;
    // O tipo 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL' é usado para filtros no frontend/backend
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'; 
}

/**
 * [EXPORT CORRIGIDO] Interface de resposta paginada.
 * Corresponde ao TimeRecordPageResponse no Java.
 */
export interface TimeRecordPageResponse {
    records: TimeRecordResponse[]; // Reutiliza a interface TimeRecordResponse
    totalPages: number;
    totalElements: number;
    currentPage: number;
    isFirst: boolean;
    isLast: boolean;
}

// Para manter a consistência e resolver o erro "Cannot find name 'ITimeRecordPageResponse'", 
// iremos re-exportar ou renomear. Por convenção, usaremos TimeRecordPageResponse.
export type ITimeRecordPageResponse = TimeRecordPageResponse;