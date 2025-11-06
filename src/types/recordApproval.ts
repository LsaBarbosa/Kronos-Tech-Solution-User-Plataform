// src/types/recordApproval.ts

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